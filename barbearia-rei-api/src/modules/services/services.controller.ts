import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success } from '../../utils/response'
import {
  listServices,
  getServiceById,
  createService,
  updateService,
  deactivateService,
} from './services.service'

export async function list(req: AuthRequest, res: Response) {
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
  const services = await listServices(isActive)
  return success(res, services)
}

export async function getOne(req: AuthRequest, res: Response) {
  return success(res, await getServiceById(req.params.id))
}

export async function create(req: AuthRequest, res: Response) {
  return success(res, await createService(req.body), 201)
}

export async function update(req: AuthRequest, res: Response) {
  return success(res, await updateService(req.params.id, req.body))
}

export async function remove(req: AuthRequest, res: Response) {
  await deactivateService(req.params.id)
  return success(res, { message: 'Serviço desativado com sucesso' })
}
