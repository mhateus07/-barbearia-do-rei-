import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success } from '../../utils/response'
import { AppError } from '../../lib/errors'
import {
  getOrCreateSubscription,
  getPaymentsHistory,
  startCardCheckout,
  startPixCheckout,
  cancelSubscription,
} from './billing.service'

export async function getSubscription(req: AuthRequest, res: Response) {
  return success(res, await getOrCreateSubscription())
}

export async function getPayments(req: AuthRequest, res: Response) {
  return success(res, await getPaymentsHistory())
}

export async function checkoutCard(req: AuthRequest, res: Response) {
  if (!req.adminEmail) throw new AppError('Não foi possível identificar o e-mail do responsável.', 400)
  return success(res, await startCardCheckout(req.adminEmail))
}

export async function checkoutPix(req: AuthRequest, res: Response) {
  if (!req.adminEmail) throw new AppError('Não foi possível identificar o e-mail do responsável.', 400)
  return success(res, await startPixCheckout(req.adminEmail), 201)
}

export async function cancel(req: AuthRequest, res: Response) {
  return success(res, await cancelSubscription())
}
