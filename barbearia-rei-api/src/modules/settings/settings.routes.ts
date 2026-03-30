import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { updateSettingsSchema } from './settings.schema'
import { getSettingsHandler, updateSettingsHandler } from './settings.controller'

const router = Router()

router.get('/', getSettingsHandler)
router.patch('/', validate(updateSettingsSchema), updateSettingsHandler)

export default router
