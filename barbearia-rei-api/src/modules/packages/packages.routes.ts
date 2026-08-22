import { Router } from 'express'
import { list, create, update, remove, sell } from './packages.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createPackageSchema, updatePackageSchema, sellPackageSchema } from './packages.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createPackageSchema), create)
router.patch('/:id', validate(updatePackageSchema), update)
router.delete('/:id', remove)
router.post('/sell', validate(sellPackageSchema), sell)

export default router
