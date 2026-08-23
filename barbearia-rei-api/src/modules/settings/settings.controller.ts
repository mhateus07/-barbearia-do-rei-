import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success } from '../../utils/response'
import { getSettings, updateSettings } from './settings.service'

export async function getSettingsHandler(req: AuthRequest, res: Response) {
  return success(res, await getSettings())
}

export async function updateSettingsHandler(req: AuthRequest, res: Response) {
  return success(res, await updateSettings(req.body))
}
