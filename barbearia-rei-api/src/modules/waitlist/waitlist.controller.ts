import { Response } from 'express'
import { WaitlistStatus } from '@prisma/client'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, paginate } from '../../utils/response'
import { listWaitlistEntries, createWaitlistEntry, updateWaitlistStatus, deleteWaitlistEntry } from './waitlist.service'

export async function list(req: AuthRequest, res: Response) {
  const { status, page = '1', limit = '50' } = req.query as Record<string, string>
  const result = await listWaitlistEntries({
    status: status as WaitlistStatus,
    page: Number(page),
    limit: Number(limit),
  })
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function create(req: AuthRequest, res: Response) {
  return success(res, await createWaitlistEntry(req.body), 201)
}

export async function updateStatus(req: AuthRequest, res: Response) {
  return success(res, await updateWaitlistStatus(req.params.id, req.body.status))
}

export async function remove(req: AuthRequest, res: Response) {
  await deleteWaitlistEntry(req.params.id)
  return success(res, { message: 'Removido da lista de espera' })
}
