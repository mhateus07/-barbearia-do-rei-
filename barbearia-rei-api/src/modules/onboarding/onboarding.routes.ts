import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { signupSchema } from './onboarding.schema'
import { signupHandler } from './onboarding.controller'
import { signupRateLimit } from '../../middlewares/rate-limit.middleware'

const router = Router()

router.post('/signup', signupRateLimit, validate(signupSchema), signupHandler)

export default router
