import { Response } from 'express'
import { AppointmentStatus } from '@prisma/client'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, paginate, apiError } from '../../utils/response'
import {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from './appointments.service'

export async function list(req: AuthRequest, res: Response) {
  const { date, from, to, barberId, clientId, status, page = '1', limit = '50' } =
    req.query as Record<string, string>
  const result = await listAppointments({
    date,
    from,
    to,
    barberId,
    clientId,
    status: status as AppointmentStatus,
    page: Number(page),
    limit: Number(limit),
  })
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    return success(res, await getAppointmentById(req.params.id))
  } catch (err) {
    return apiError(res, (err as Error).message, 404)
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    return success(res, await createAppointment(req.body), 201)
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    return success(res, await updateAppointment(req.params.id, req.body))
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    return success(res, await updateAppointmentStatus(req.params.id, req.body))
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteAppointment(req.params.id)
    return success(res, { message: 'Agendamento removido com sucesso' })
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}
