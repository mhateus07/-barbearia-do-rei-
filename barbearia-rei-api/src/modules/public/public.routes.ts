import { Router } from 'express'
import * as PublicController from './public.controller'

const router = Router()

router.get('/info', PublicController.getInfo)
router.get('/services', PublicController.getServices)
router.get('/barbers', PublicController.getBarbers)
router.get('/barbers/:barberId/slots', PublicController.getSlots)
router.post('/appointments', PublicController.createAppointment)

export default router
