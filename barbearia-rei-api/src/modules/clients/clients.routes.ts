import { Router } from 'express'
import {
  list,
  getOne,
  create,
  update,
  remove,
  clientAppointments,
  clientLoyalty,
  redeemLoyalty,
  clientPackages,
} from './clients.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createClientSchema, updateClientSchema } from './clients.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createClientSchema), create)
router.get('/:id', getOne)
router.patch('/:id', validate(updateClientSchema), update)
router.delete('/:id', remove)
router.get('/:id/appointments', clientAppointments)
router.get('/:id/loyalty', clientLoyalty)
router.post('/:id/loyalty/redeem', redeemLoyalty)
router.get('/:id/packages', clientPackages)

export default router
