import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { loginService, getMeService } from './auth.service'
import { success, apiError } from '../../utils/response'
import { LoginInput } from './auth.schema'

export async function login(req: AuthRequest, res: Response) {
  try {
    const result = await loginService(req.body as LoginInput)
    return success(res, result)
  } catch (err) {
    return apiError(res, (err as Error).message, 401)
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const admin = await getMeService(req.adminId!)
    return success(res, admin)
  } catch (err) {
    return apiError(res, (err as Error).message, 404)
  }
}
