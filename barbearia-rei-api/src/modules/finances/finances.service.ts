import { ExpenseStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CreatePaymentInput,
  CreateExpenseInput,
  UpdateExpenseInput,
  PayExpenseInput,
} from './finances.schema'

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export async function listPayments(filters: {
  from?: string
  to?: string
  method?: string
  page?: number
  limit?: number
}) {
  const { from, to, method, page = 1, limit = 50 } = filters

  const where: Record<string, unknown> = {}

  if (from || to) {
    where.paidAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
    }
  }

  if (method) where.method = method

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            startsAt: true,
            totalPrice: true,
            client: { select: { id: true, name: true } },
            barber: { select: { id: true, name: true } },
            services: { include: { service: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return { data, total, page, limit }
}

export async function createPayment(input: CreatePaymentInput) {
  if (input.appointmentId) {
    const existing = await prisma.payment.findUnique({
      where: { appointmentId: input.appointmentId },
    })
    if (existing) throw new Error('Este agendamento já possui um pagamento registrado')

    const appointment = await prisma.appointment.findUnique({
      where: { id: input.appointmentId },
    })
    if (!appointment) throw new Error('Agendamento não encontrado')
  }

  return prisma.payment.create({
    data: {
      amount: input.amount,
      method: input.method,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      notes: input.notes,
      appointmentId: input.appointmentId,
    },
    include: {
      appointment: {
        select: {
          id: true,
          startsAt: true,
          totalPrice: true,
          client: { select: { id: true, name: true } },
          barber: { select: { id: true, name: true } },
          services: { include: { service: { select: { id: true, name: true } } } },
        },
      },
    },
  })
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment) throw new Error('Pagamento não encontrado')
  return prisma.payment.delete({ where: { id } })
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export async function listExpenses(filters: {
  status?: ExpenseStatus
  from?: string
  to?: string
  category?: string
  page?: number
  limit?: number
}) {
  const { status, from, to, category, page = 1, limit = 50 } = filters

  const where: Record<string, unknown> = {}

  if (status) where.status = status
  if (category) where.category = category

  if (from || to) {
    where.dueDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
    }
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ])

  return { data, total, page, limit }
}

export async function createExpense(input: CreateExpenseInput) {
  return prisma.expense.create({
    data: {
      description: input.description,
      amount: input.amount,
      category: input.category,
      dueDate: new Date(input.dueDate),
      notes: input.notes,
    },
  })
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) throw new Error('Despesa não encontrada')

  return prisma.expense.update({
    where: { id },
    data: {
      description: input.description,
      amount: input.amount,
      category: input.category,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      notes: input.notes,
      status: input.status,
    },
  })
}

export async function payExpense(id: string, input: PayExpenseInput) {
  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) throw new Error('Despesa não encontrada')
  if (expense.status === ExpenseStatus.PAID) throw new Error('Despesa já foi paga')

  return prisma.expense.update({
    where: { id },
    data: {
      status: ExpenseStatus.PAID,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
    },
  })
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) throw new Error('Despesa não encontrada')
  return prisma.expense.delete({ where: { id } })
}

// ─── COMMISSIONS ─────────────────────────────────────────────────────────────

export async function getCommissions(from?: string, to?: string) {
  const fromDate = from ? new Date(`${from}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const toDate = to ? new Date(`${to}T23:59:59`) : new Date()

  const barbers = await prisma.barber.findMany({ where: { isActive: true } })

  const appointments = await prisma.appointment.findMany({
    where: {
      status: 'COMPLETED',
      startsAt: { gte: fromDate, lte: toDate },
    },
    select: {
      barberId: true,
      totalPrice: true,
    },
  })

  return barbers.map((barber) => {
    const barberAppointments = appointments.filter((a) => a.barberId === barber.id)
    const totalRevenue = barberAppointments.reduce((sum, a) => sum + Number(a.totalPrice), 0)
    const rate = Number(barber.commissionRate ?? 0)
    const commission = (totalRevenue * rate) / 100
    return {
      barberId: barber.id,
      barberName: barber.name,
      commissionRate: rate,
      totalRevenue,
      commission,
      appointmentsCount: barberAppointments.length,
    }
  })
}

// ─── FINANCIAL SUMMARY ───────────────────────────────────────────────────────

export async function getFinancialSummary(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const toDate = to ? new Date(`${to}T23:59:59`) : new Date()

  const [payments, expenses, pendingExpenses] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: fromDate, lte: toDate } },
      select: { amount: true, method: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: {
        status: ExpenseStatus.PAID,
        paidAt: { gte: fromDate, lte: toDate },
      },
      select: { amount: true, category: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: { status: { not: ExpenseStatus.PAID } },
      select: { amount: true, dueDate: true, status: true, description: true },
    }),
  ])

  const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const balance = totalIncome - totalExpenses

  const totalPending = pendingExpenses
    .filter((e) => e.status === ExpenseStatus.PENDING)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const totalOverdue = pendingExpenses
    .filter((e) => e.status === ExpenseStatus.OVERDUE || (e.status === ExpenseStatus.PENDING && new Date(e.dueDate) < new Date()))
    .reduce((sum, e) => sum + Number(e.amount), 0)

  // Income by payment method
  const incomeByMethod: Record<string, number> = {}
  for (const p of payments) {
    incomeByMethod[p.method] = (incomeByMethod[p.method] ?? 0) + Number(p.amount)
  }

  // Expenses by category
  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + Number(e.amount)
  }

  // Cash flow by day (last 30 days or the period)
  const dayMap: Record<string, { income: number; expenses: number }> = {}

  for (const p of payments) {
    const day = new Date(p.paidAt).toISOString().split('T')[0]
    if (!dayMap[day]) dayMap[day] = { income: 0, expenses: 0 }
    dayMap[day].income += Number(p.amount)
  }

  for (const e of expenses) {
    const day = new Date(e.paidAt!).toISOString().split('T')[0]
    if (!dayMap[day]) dayMap[day] = { income: 0, expenses: 0 }
    dayMap[day].expenses += Number(e.amount)
  }

  const cashFlowByDay = Object.entries(dayMap)
    .map(([date, values]) => ({ date, ...values, balance: values.income - values.expenses }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalIncome,
    totalExpenses,
    balance,
    totalPending,
    totalOverdue,
    incomeByMethod,
    expensesByCategory,
    cashFlowByDay,
    period: { from: fromDate.toISOString(), to: toDate.toISOString() },
  }
}
