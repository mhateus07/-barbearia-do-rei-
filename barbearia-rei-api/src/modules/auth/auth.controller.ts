import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { loginService, getMeService } from './auth.service'
import { success } from '../../utils/response'
import { LoginInput } from './auth.schema'

export async function login(req: AuthRequest, res: Response) {
  const result = await loginService(req.body as LoginInput)
  return success(res, result)
}

export async function getMe(req: AuthRequest, res: Response) {
  const admin = await getMeService(req.adminId!)
  return success(res, admin)
}
