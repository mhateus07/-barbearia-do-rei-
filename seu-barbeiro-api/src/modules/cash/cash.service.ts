import { prisma } from '../../lib/prisma'
import { runSchedule, type Tx } from '../appointments/scheduling'

const round = (value: number) => Math.round(value * 100) / 100

/** Resumo do caixa: dinheiro esperado na gaveta e entradas por forma de pagamento. */
export async function summarize(db: Tx | typeof prisma, sessionId: string) {
  const session = await db.cashSession.findUnique({
    where: { id: sessionId },
    include: { movements: { orderBy: { createdAt: 'asc' } } },
  })
  if (!session) throw new Error('Caixa não encontrado')
  const until = session.closedAt ?? new Date()
  const payments = await db.payment.findMany({
    where: {
      OR: [
        { paidAt: { gte: session.openedAt, lte: until } },
        { refundedAt: { gte: session.openedAt, lte: until } },
      ],
    },
    select: { amount: true, method: true, paidAt: true, refundedAt: true },
  })
  const byMethod: Record<string, number> = {}
  let cashIn = 0,
    cashRefunds = 0
  for (const p of payments) {
    const amount = Number(p.amount)
    if (p.paidAt >= session.openedAt && p.paidAt <= until) {
      byMethod[p.method] = (byMethod[p.method] ?? 0) + amount
      if (p.method === 'CASH') cashIn += amount
    }
    if (p.refundedAt && p.refundedAt >= session.openedAt && p.refundedAt <= until) {
      byMethod[p.method] = (byMethod[p.method] ?? 0) - amount
      if (p.method === 'CASH') cashRefunds += amount
    }
  }
  const supplies = session.movements
    .filter((m) => m.kind === 'SUPPLY')
    .reduce((sum, m) => sum + Number(m.amount), 0)
  const withdrawals = session.movements
    .filter((m) => m.kind === 'WITHDRAWAL')
    .reduce((sum, m) => sum + Number(m.amount), 0)
  const expected = round(
    Number(session.openingAmount) + cashIn - cashRefunds + supplies - withdrawals,
  )
  return {
    ...session,
    openingAmount: Number(session.openingAmount),
    cashIn: round(cashIn),
    cashRefunds: round(cashRefunds),
    supplies: round(supplies),
    withdrawals: round(withdrawals),
    expected,
    byMethod: Object.fromEntries(
      Object.entries(byMethod).map(([k, v]) => [k, round(v)]),
    ),
    difference:
      session.countedAmount !== null
        ? round(Number(session.countedAmount) - Number(session.expectedAmount))
        : null,
  }
}

export async function currentSession() {
  const open = await prisma.cashSession.findFirst({ where: { closedAt: null } })
  return open ? summarize(prisma, open.id) : null
}

export async function openSession(openingAmount: number, adminId: string) {
  return runSchedule(async (tx) => {
    if (await tx.cashSession.count({ where: { closedAt: null } }))
      throw new Error('Já existe um caixa aberto')
    return tx.cashSession.create({ data: { openingAmount, openedById: adminId } })
  })
}

export async function addMovement(
  tx: Tx,
  input: { kind: 'SUPPLY' | 'WITHDRAWAL'; amount: number; reason: string; adminId?: string },
) {
  const open = await tx.cashSession.findFirst({ where: { closedAt: null } })
  if (!open) throw new Error('Abra o caixa antes de lançar movimentações')
  if (input.kind === 'WITHDRAWAL') {
    const { expected } = await summarize(tx, open.id)
    if (Math.round(input.amount * 100) > Math.round(expected * 100))
      throw new Error('Valor maior que o dinheiro esperado no caixa')
  }
  return tx.cashMovement.create({
    data: {
      sessionId: open.id,
      kind: input.kind,
      amount: input.amount,
      reason: input.reason,
      createdById: input.adminId,
    },
  })
}

export async function closeSession(input: {
  countedAmount: number
  notes?: string
  adminId: string
}) {
  return runSchedule(async (tx) => {
    const open = await tx.cashSession.findFirst({ where: { closedAt: null } })
    if (!open) throw new Error('Nenhum caixa aberto')
    const closedAt = new Date()
    // Congela o período antes de calcular, para o resumo bater com o fechamento.
    await tx.cashSession.update({ where: { id: open.id }, data: { closedAt } })
    const { expected } = await summarize(tx, open.id)
    await tx.cashSession.update({
      where: { id: open.id },
      data: {
        closedById: input.adminId,
        expectedAmount: expected,
        countedAmount: input.countedAmount,
        notes: input.notes,
      },
    })
    return summarize(tx, open.id)
  })
}

export async function history(limit = 30) {
  const sessions = await prisma.cashSession.findMany({
    where: { closedAt: { not: null } },
    orderBy: { openedAt: 'desc' },
    take: limit,
  })
  return sessions.map((s) => ({
    id: s.id,
    openedAt: s.openedAt,
    closedAt: s.closedAt,
    openingAmount: Number(s.openingAmount),
    expectedAmount: Number(s.expectedAmount ?? 0),
    countedAmount: Number(s.countedAmount ?? 0),
    difference: round(Number(s.countedAmount ?? 0) - Number(s.expectedAmount ?? 0)),
    notes: s.notes,
  }))
}
