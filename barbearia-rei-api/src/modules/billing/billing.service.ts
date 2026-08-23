import { SubscriptionPaymentStatus, SubscriptionStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { getTenantId, runWithTenant } from '../../lib/tenant-context'
import { AppError } from '../../lib/errors'
import { env } from '../../config/env'
import {
  createCardPreapproval,
  getPreapproval,
  cancelPreapproval,
  createPixPayment,
  getPayment,
} from '../../lib/mercadopago'

const PLAN_REASON = 'Assinatura mensal — painel de gestão'

const subscriptionInclude = {
  payments: { orderBy: { createdAt: 'desc' as const }, take: 20 },
}

type SubscriptionWithPayments = Awaited<ReturnType<typeof getOrCreateSubscription>>

function addOneMonth(date: Date): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  return d
}

function mapMpPaymentStatus(mpStatus: string): SubscriptionPaymentStatus {
  switch (mpStatus) {
    case 'approved':
      return 'PAID'
    case 'refunded':
    case 'charged_back':
      return 'REFUNDED'
    case 'rejected':
    case 'cancelled':
      return 'FAILED'
    default:
      return 'PENDING'
  }
}

function mapMpPreapprovalStatus(mpStatus: string): SubscriptionStatus {
  switch (mpStatus) {
    case 'authorized':
      return 'ACTIVE'
    case 'paused':
      return 'PAST_DUE'
    case 'cancelled':
      return 'CANCELED'
    default:
      return 'PENDING_SETUP'
  }
}

// ─── ASSINATURA (visão do tenant) ───────────────────────────────────────────

export async function getOrCreateSubscription() {
  const tenantId = getTenantId()
  const existing = await prisma.subscription.findUnique({ where: { tenantId }, include: subscriptionInclude })
  if (existing) return existing
  return prisma.subscription.create({
    data: { tenantId, amount: env.MP_PLAN_PRICE },
    include: subscriptionInclude,
  })
}

export async function getPaymentsHistory() {
  const tenantId = getTenantId()
  return prisma.subscriptionPayment.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } })
}

// ─── CHECKOUT — CARTÃO (preapproval, cobrado automaticamente pelo MP) ──────────

export async function startCardCheckout(payerEmail: string) {
  const tenantId = getTenantId()
  const subscription = await getOrCreateSubscription()
  if (subscription.status === 'ACTIVE' && subscription.method === 'CARD') {
    throw new AppError('A assinatura por cartão já está ativa.', 400)
  }

  const preapproval = await createCardPreapproval({
    payerEmail,
    amount: Number(subscription.amount),
    reason: PLAN_REASON,
    externalReference: tenantId,
  })

  await prisma.subscription.update({
    where: { tenantId },
    data: { method: 'CARD', mpPreapprovalId: preapproval.id, mpPayerEmail: payerEmail },
  })

  return { checkoutUrl: preapproval.init_point }
}

// ─── CHECKOUT — PIX (cobrança avulsa, renovada pelo job de background) ─────────

async function generatePixCharge(subscription: SubscriptionWithPayments, dueDate: Date) {
  if (!subscription.mpPayerEmail) {
    throw new AppError('E-mail de cobrança não configurado para esta assinatura.', 400)
  }

  const local = await prisma.subscriptionPayment.create({
    data: {
      tenantId: subscription.tenantId,
      subscriptionId: subscription.id,
      method: 'PIX',
      amount: subscription.amount,
      dueDate,
    },
  })

  const mpPayment = await createPixPayment({
    payerEmail: subscription.mpPayerEmail,
    amount: Number(subscription.amount),
    description: PLAN_REASON,
    // Correlaciona a notificação do webhook de volta a esta linha — ver
    // handlePaymentNotification.
    externalReference: local.id,
  })

  const updated = await prisma.subscriptionPayment.update({
    where: { id: local.id },
    data: {
      mpPaymentId: String(mpPayment.id),
      pixQrCode: mpPayment.point_of_interaction?.transaction_data?.qr_code_base64,
      pixCopyPaste: mpPayment.point_of_interaction?.transaction_data?.qr_code,
    },
  })

  await prisma.subscription.update({
    where: { tenantId: subscription.tenantId },
    data: { nextDueDate: addOneMonth(dueDate) },
  })

  return updated
}

export async function startPixCheckout(payerEmail: string) {
  const tenantId = getTenantId()
  let subscription = await getOrCreateSubscription()

  const openPayment = subscription.payments.find((p) => p.status === 'PENDING' && p.method === 'PIX')
  if (openPayment) return openPayment

  if (subscription.method !== 'PIX' || subscription.mpPayerEmail !== payerEmail) {
    subscription = await prisma.subscription.update({
      where: { tenantId },
      data: { method: 'PIX', mpPayerEmail: payerEmail },
      include: subscriptionInclude,
    })
  }

  return generatePixCharge(subscription, new Date())
}

// Chamado pelo job de renovação (dentro de runWithTenant, sem request HTTP) —
// gera a próxima cobrança Pix do ciclo se ainda não houver uma pendente.
export async function renewPixSubscription() {
  const tenantId = getTenantId()
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
    include: subscriptionInclude,
  })
  if (!subscription || subscription.method !== 'PIX' || !subscription.mpPayerEmail) return null
  if (subscription.status === 'CANCELED') return null

  const openPayment = subscription.payments.find((p) => p.status === 'PENDING')
  if (openPayment) return openPayment

  return generatePixCharge(subscription, subscription.nextDueDate ?? new Date())
}

// Usado pelo scan do scheduler (sem contexto de tenant, mesma exceção
// documentada em scheduler.worker.ts) pra descobrir quais tenants precisam
// de uma nova cobrança Pix gerada nos próximos dias.
export async function findTenantsDueForPixRenewal(withinDays = 3) {
  const threshold = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000)
  const subscriptions = await prisma.subscription.findMany({
    where: {
      method: 'PIX',
      status: { in: ['ACTIVE', 'PAST_DUE'] },
      mpPayerEmail: { not: null },
      nextDueDate: { lte: threshold },
    },
    select: { tenantId: true },
  })
  return subscriptions.map((s) => s.tenantId)
}

// ─── CANCELAMENTO ───────────────────────────────────────────────────────────

export async function cancelSubscription() {
  const tenantId = getTenantId()
  const subscription = await prisma.subscription.findUnique({ where: { tenantId } })
  if (!subscription) throw new AppError('Nenhuma assinatura encontrada.', 404)

  if (subscription.mpPreapprovalId) {
    await cancelPreapproval(subscription.mpPreapprovalId)
  }

  return prisma.subscription.update({
    where: { tenantId },
    data: { status: 'CANCELED', canceledAt: new Date() },
  })
}

// ─── WEBHOOK ────────────────────────────────────────────────────────────────

async function handlePaymentNotification(paymentId: string) {
  const payment = await getPayment(paymentId)

  let subscriptionPayment = payment.external_reference
    ? await prisma.subscriptionPayment.findUnique({ where: { id: payment.external_reference } })
    : null
  if (!subscriptionPayment) {
    subscriptionPayment = await prisma.subscriptionPayment.findUnique({
      where: { mpPaymentId: String(payment.id) },
    })
  }

  if (!subscriptionPayment) {
    // Cobrança de cartão gerada automaticamente pelo MP a partir de um
    // preapproval (não passa por generatePixCharge, então não existe linha
    // local ainda). O `external_reference` do preapproval (= tenantId, ver
    // startCardCheckout) só é garantido nos pagamentos gerados pelo próprio
    // ciclo do preapproval — CONFERIR contra a doc atual do MP em produção;
    // se o comportamento mudar, cair aqui sem tenantId é só ignorado abaixo.
    const tenantId = payment.external_reference
    if (!tenantId) return
    const subscription = await prisma.subscription.findUnique({ where: { tenantId } })
    if (!subscription) return
    subscriptionPayment = await prisma.subscriptionPayment.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        method: 'CARD',
        amount: subscription.amount,
        dueDate: new Date(),
        mpPaymentId: String(payment.id),
      },
    })
  }

  const status = mapMpPaymentStatus(payment.status)
  const tenantId = subscriptionPayment.tenantId
  const paymentRowId = subscriptionPayment.id
  const previousPaidAt = subscriptionPayment.paidAt

  await runWithTenant(tenantId, async () => {
    await prisma.subscriptionPayment.update({
      where: { id: paymentRowId },
      data: {
        status,
        mpPaymentId: String(payment.id),
        paidAt: status === 'PAID' ? new Date() : previousPaidAt,
        rawPayload: payment as unknown as object,
      },
    })

    if (status === 'PAID') {
      await prisma.subscription.update({
        where: { tenantId },
        data: { status: 'ACTIVE', nextDueDate: addOneMonth(new Date()) },
      })
    } else if (status === 'FAILED') {
      await prisma.subscription.update({ where: { tenantId }, data: { status: 'PAST_DUE' } })
    }
  })
}

async function handlePreapprovalNotification(preapprovalId: string) {
  const preapproval = await getPreapproval(preapprovalId)
  const subscription = await prisma.subscription.findUnique({ where: { mpPreapprovalId: preapprovalId } })
  if (!subscription) return

  const status = mapMpPreapprovalStatus(preapproval.status)
  await runWithTenant(subscription.tenantId, async () => {
    await prisma.subscription.update({ where: { tenantId: subscription.tenantId }, data: { status } })
  })
}

/**
 * Ponto de entrada do webhook — chamado sem contexto de tenant (o tenant só
 * é conhecido depois de resolver o recurso). Nunca confia em valores vindos
 * direto do corpo/query da notificação: sempre rebusca o recurso pela API do
 * MP usando o id antes de agir.
 */
export async function handleWebhook(topic: string, resourceId: string) {
  if (topic === 'payment' || topic === 'subscription_authorized_payment') {
    await handlePaymentNotification(resourceId)
  } else if (topic === 'preapproval') {
    await handlePreapprovalNotification(resourceId)
  }
  // Outros topics (merchant_order etc.) são ignorados silenciosamente.
}
