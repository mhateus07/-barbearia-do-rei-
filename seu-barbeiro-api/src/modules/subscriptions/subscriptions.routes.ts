import { Router } from 'express'
import { businessErrors } from '../../utils/route-errors'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { allowRoles } from '../../middlewares/auth.middleware'
import { payLink } from '../payments/pix.service'
import {
  applyToAppointment,
  benefitFor,
  cancelSubscription,
  createSubscription,
  payChargeManually,
  removeFromAppointment,
  startCharge,
  usesInPeriod,
} from './subscriptions.service'

const router = Router()
const owner = allowRoles('OWNER')
const uuid = z.string().uuid()
const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().max(400).optional(),
  price: z.number().positive().max(100000),
  serviceIds: z.array(uuid).max(50).default([]),
  usesPerCycle: z.number().int().positive().max(100).nullable().default(null),
  isActive: z.boolean().optional(),
})

router.get('/plans', async (_req, res) => {
  res.json(await prisma.plan.findMany({ orderBy: [{ isActive: 'desc' }, { price: 'asc' }] }))
})
router.post('/plans', owner, async (req, res) => {
  res.status(201).json(await prisma.plan.create({ data: planSchema.parse(req.body) }))
})
router.patch('/plans/:id', owner, async (req, res) => {
  res.json(
    await prisma.plan.update({
      where: { id: uuid.parse(req.params.id) },
      data: planSchema.partial().parse(req.body),
    }),
  )
})

router.get('/', async (_req, res) => {
  const subs = await prisma.subscription.findMany({
    include: {
      client: { select: { id: true, name: true, phone: true } },
      plan: true,
      charges: {
        orderBy: { periodStart: 'desc' },
        take: 3,
        include: { pixCharges: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })
  res.json(
    await Promise.all(
      subs.map(async (s) => ({
        ...s,
        uses:
          s.currentPeriodStart && s.currentPeriodEnd
            ? await usesInPeriod(prisma, s.id, s.currentPeriodStart, s.currentPeriodEnd)
            : 0,
        charges: s.charges.map(({ pixCharges, ...c }) => ({
          ...c,
          pix: pixCharges[0]
            ? {
                status: pixCharges[0].status,
                qrCode: pixCharges[0].qrCode,
                link: payLink(pixCharges[0].token),
                expiresAt: pixCharges[0].expiresAt,
              }
            : null,
        })),
      })),
    ),
  )
})
router.post('/', async (req, res) => {
  const data = z
    .object({
      clientId: uuid,
      planId: uuid,
      startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    })
    .parse(req.body)
  res.status(201).json(
    await createSubscription({
      clientId: data.clientId,
      planId: data.planId,
      startsAt: data.startsAt ? new Date(`${data.startsAt}T00:00:00`) : undefined,
    }),
  )
})
router.post('/:id/cancel', async (req, res) => {
  await cancelSubscription(uuid.parse(req.params.id))
  res.json({ cancelled: true })
})
router.post('/charges/:id/pix', async (req, res) => {
  const pix = await startCharge(uuid.parse(req.params.id))
  if (!pix) throw new Error('Configure o Mercado Pago ou registre o pagamento manualmente')
  res.json({ link: payLink(pix.token), qrCode: pix.qrCode })
})
router.post('/charges/:id/manual', async (req, res) => {
  const { method } = z
    .object({ method: z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD']) })
    .parse(req.body)
  await payChargeManually(uuid.parse(req.params.id), method)
  res.json({ paid: true })
})

// Situação da assinatura do cliente na data do atendimento (usada na comanda).
router.get('/appointments/:id', async (req, res) => {
  const a = await prisma.appointment.findUnique({
    where: { id: uuid.parse(req.params.id) },
  })
  if (!a) throw new Error('Atendimento não encontrado')
  const sub = await benefitFor(prisma, a.clientId, a.startsAt)
  if (!sub) return res.json(null)
  res.json({
    id: sub.id,
    plan: sub.plan.name,
    status: sub.status,
    usesPerCycle: sub.plan.usesPerCycle,
    uses: await usesInPeriod(prisma, sub.id, sub.currentPeriodStart!, sub.currentPeriodEnd!),
    periodEnd: sub.currentPeriodEnd,
    applied: a.subscriptionId === sub.id,
  })
})
router.post('/appointments/:id', async (req, res) => {
  res.json(await applyToAppointment(uuid.parse(req.params.id)))
})
router.delete('/appointments/:id', async (req, res) => {
  res.json(await removeFromAppointment(uuid.parse(req.params.id)))
})

router.use(businessErrors)

export default router
