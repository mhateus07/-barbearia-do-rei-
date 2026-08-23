import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success } from '../../utils/response'
import {
  listPackages,
  createPackage,
  updatePackage,
  deactivatePackage,
  sellPackageToClient,
} from './packages.service'

export async function list(req: AuthRequest, res: Response) {
  const { isActive } = req.query as Record<string, string>
  const result = await listPackages(isActive !== undefined ? isActive === 'true' : undefined)
  return success(res, result)
}

export async function create(req: AuthRequest, res: Response) {
  return success(res, await createPackage(req.body), 201)
}

export async function update(req: AuthRequest, res: Response) {
  return success(res, await updatePackage(req.params.id, req.body))
}

export async function remove(req: AuthRequest, res: Response) {
  await deactivatePackage(req.params.id)
  return success(res, { message: 'Pacote desativado com sucesso' })
}

export async function sell(req: AuthRequest, res: Response) {
  return success(res, await sellPackageToClient(req.body), 201)
}
