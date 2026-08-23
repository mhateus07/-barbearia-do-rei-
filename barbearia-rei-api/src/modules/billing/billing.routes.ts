import { Router } from 'express'
import { getSubscription, getPayments, checkoutCard, checkoutPix, cancel } from './billing.controller'

const router = Router()

router.get('/subscription', getSubscription)
router.get('/subscription/payments', getPayments)
router.post('/subscription/checkout/card', checkoutCard)
router.post('/subscription/checkout/pix', checkoutPix)
router.post('/subscription/cancel', cancel)

export default router
