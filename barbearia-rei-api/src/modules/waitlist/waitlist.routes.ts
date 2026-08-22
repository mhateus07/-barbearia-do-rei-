import { Router } from 'express'
import { list, create, updateStatus, remove } from './waitlist.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createWaitlistEntrySchema, updateWaitlistStatusSchema } from './waitlist.schema'

const router = Router()

router.get('/', list)
router.post('/', validate(createWaitlistEntrySchema), create)
router.patch('/:id/status', validate(updateWaitlistStatusSchema), updateStatus)
router.delete('/:id', remove)

export default router
