import { Request, Response } from 'express'
import { success, apiError } from '../../utils/response'
import { signupTenant } from './onboarding.service'
import { SignupInput } from './onboarding.schema'

export async function signupHandler(req: Request, res: Response) {
  try {
    const result = await signupTenant(req.body as SignupInput)
    return success(res, result, 201)
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}
