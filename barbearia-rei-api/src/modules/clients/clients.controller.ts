import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, paginate, apiError } from '../../utils/response'
import {
  listClients,
  listClientsWithLoyalty,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientAppointments,
  getClientLoyalty,
  redeemLoyaltyPoints,
} from './clients.service'
import { listClientPackages } from '../packages/packages.service'

export async function list(req: AuthRequest, res: Response) {
  const { search, page = '1', limit = '20', withLoyalty } = req.query as Record<string, string>
  const result =
    withLoyalty === 'true'
      ? await listClientsWithLoyalty(search, Number(page), Number(limit))
      : await listClients(search, Number(page), Number(limit))
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function getOne(req: AuthRequest, res: Response) {
  return success(res, await getClientById(req.params.id))
}

export async function create(req: AuthRequest, res: Response) {
  return success(res, await createClient(req.body), 201)
}

export async function update(req: AuthRequest, res: Response) {
  return success(res, await updateClient(req.params.id, req.body))
}

export async function remove(req: AuthRequest, res: Response) {
  await deleteClient(req.params.id)
  return success(res, { message: 'Cliente removido com sucesso' })
}

export async function clientAppointments(req: AuthRequest, res: Response) {
  return success(res, await getClientAppointments(req.params.id))
}

export async function clientLoyalty(req: AuthRequest, res: Response) {
  return success(res, await getClientLoyalty(req.params.id))
}

export async function clientPackages(req: AuthRequest, res: Response) {
  return success(res, await listClientPackages(req.params.id))
}

export async function redeemLoyalty(req: AuthRequest, res: Response) {
  const { points } = req.body
  if (!points || points <= 0) return apiError(res, 'Informe a quantidade de pontos a resgatar', 400)
  return success(res, await redeemLoyaltyPoints(req.params.id, Number(points)))
}
