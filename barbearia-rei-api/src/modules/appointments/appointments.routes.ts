import { Router } from 'express'
import { list, getOne, create, update, updateStatus, remove } from './appointments.controller'
import { validate } from '../../middlewares/validate.middleware'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateStatusSchema,
} from './appointments.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createAppointmentSchema), create)
router.get('/:id', getOne)
router.patch('/:id', validate(updateAppointmentSchema), update)
router.patch('/:id/status', validate(updateStatusSchema), updateStatus)
router.delete('/:id', remove)

export default router
