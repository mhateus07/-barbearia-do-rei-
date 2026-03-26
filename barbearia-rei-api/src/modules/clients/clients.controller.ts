import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, paginate, apiError } from '../../utils/response'
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientAppointments,
} from './clients.service'

export async function list(req: AuthRequest, res: Response) {
  const { search, page = '1', limit = '20' } = req.query as Record<string, string>
  const result = await listClients(search, Number(page), Number(limit))
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    return success(res, await getClientById(req.params.id))
  } catch (err) {
    return apiError(res, (err as Error).message, 404)
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    return success(res, await createClient(req.body), 201)
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    return success(res, await updateClient(req.params.id, req.body))
  } catch (err) {
    return apiError(res, (err as Error).message, 404)
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteClient(req.params.id)
    return success(res, { message: 'Cliente removido com sucesso' })
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function clientAppointments(req: AuthRequest, res: Response) {
  try {
    return success(res, await getClientAppointments(req.params.id))
  } catch (err) {
    return apiError(res, (err as Error).message, 404)
  }
}
