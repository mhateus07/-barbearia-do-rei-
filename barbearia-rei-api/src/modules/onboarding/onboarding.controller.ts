import { Request, Response } from 'express'
import { success } from '../../utils/response'
import { signupTenant } from './onboarding.service'
import { SignupInput } from './onboarding.schema'

export async function signupHandler(req: Request, res: Response) {
  const result = await signupTenant(req.body as SignupInput)
  return success(res, result, 201)
}
