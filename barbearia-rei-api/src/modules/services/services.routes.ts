import { Router } from 'express'
import { list, getOne, create, update, remove } from './services.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createServiceSchema, updateServiceSchema } from './services.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createServiceSchema), create)
router.get('/:id', getOne)
router.patch('/:id', validate(updateServiceSchema), update)
router.delete('/:id', remove)

export default router
