import { Router } from 'express'
import { login, getMe } from './auth.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { loginRateLimit } from '../../middlewares/rate-limit.middleware'
import { loginSchema } from './auth.schema'

const router = Router()

router.post('/login', loginRateLimit, validate(loginSchema), login)
router.get('/me', authMiddleware, getMe)

export default router
