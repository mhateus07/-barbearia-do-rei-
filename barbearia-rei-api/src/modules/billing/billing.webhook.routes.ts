import { Router } from 'express'
import { receiveMpWebhook } from './billing.webhook.controller'

const router = Router()

router.post('/mercadopago', receiveMpWebhook)

export default router
