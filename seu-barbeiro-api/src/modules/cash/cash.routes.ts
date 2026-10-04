import { Router } from 'express'
import { businessErrors } from '../../utils/route-errors'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { runSchedule } from '../appointments/scheduling'
import {
  addMovement,
  closeSession,
  currentSession,
  history,
  openSession,
  summarize,
} from './cash.service'

const router = Router()
const amount = z.number().nonnegative().max(1000000)

router.get('/current', async (_req, res) => {
  res.json(await currentSession())
})
router.get('/history', async (_req, res) => {
  res.json(await history())
})
router.get('/:id', async (req, res) => {
  res.json(await summarize(prisma, z.string().uuid().parse(req.params.id)))
})
router.post('/open', async (req: AuthRequest, res) => {
  const { openingAmount } = z.object({ openingAmount: amount }).parse(req.body)
  res.status(201).json(await openSession(openingAmount, req.adminId!))
})
router.post('/movements', async (req: AuthRequest, res) => {
  const data = z
    .object({
      kind: z.enum(['SUPPLY', 'WITHDRAWAL']),
      amount: z.number().positive().max(1000000),
      reason: z.string().trim().min(2).max(200),
    })
    .parse(req.body)
  res
    .status(201)
    .json(await runSchedule((tx) => addMovement(tx, { ...data, adminId: req.adminId })))
})
router.post('/close', async (req: AuthRequest, res) => {
  const data = z
    .object({ countedAmount: amount, notes: z.string().max(500).optional() })
    .parse(req.body)
  res.json(await closeSession({ ...data, adminId: req.adminId! }))
})

router.use(businessErrors)

export default router
