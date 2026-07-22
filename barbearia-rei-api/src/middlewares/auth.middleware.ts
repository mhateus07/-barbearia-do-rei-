import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'
import { runWithTenant } from '../lib/tenant-context'

export interface AuthRequest extends Request<Record<string, string>> {
  adminId?: string
  adminEmail?: string
  tenantId?: string
  tenantSlug?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Token não fornecido' } })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    req.adminId = payload.sub
    req.adminEmail = payload.email
    req.tenantId = payload.tenantId
    req.tenantSlug = payload.tenantSlug
    runWithTenant(payload.tenantId, next)
  } catch {
    return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
  }
}
