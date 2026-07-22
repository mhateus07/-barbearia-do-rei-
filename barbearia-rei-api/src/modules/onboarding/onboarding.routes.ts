import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { signupSchema } from './onboarding.schema'
import { signupHandler } from './onboarding.controller'

const router = Router()

router.post('/signup', validate(signupSchema), signupHandler)

export default router
