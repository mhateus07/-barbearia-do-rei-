import { Router } from 'express'
import { list, getOne, create, update, remove, appointments } from './barbers.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createBarberSchema, updateBarberSchema } from './barbers.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createBarberSchema), create)
router.get('/:id', getOne)
router.patch('/:id', validate(updateBarberSchema), update)
router.delete('/:id', remove)
router.get('/:id/appointments', appointments)

export default router
