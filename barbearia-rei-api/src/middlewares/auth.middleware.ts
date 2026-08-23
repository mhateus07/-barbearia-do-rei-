import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'
import { runWithTenant } from '../lib/tenant-context'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request<Record<string, string>> {
  adminId?: string
  adminEmail?: string
  tenantId?: string
  tenantSlug?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Token não fornecido' } })
  }

  const token = authHeader.split(' ')[1]

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
  }

  await runWithTenant(payload.tenantId, async () => {
    // Confere o estado atual do tenant e do admin a cada requisição — o JWT
    // por si só só prova que a assinatura é válida, não que a conta ainda
    // está ativa (ex.: tenant suspenso por falta de pagamento, admin
    // removido depois que o token foi emitido).
    const tenant = await prisma.tenant.findUnique({ where: { id: payload.tenantId } })
    if (!tenant) {
      return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
    }
    if (tenant.status === 'SUSPENDED') {
      return res.status(403).json({ error: { message: 'Conta suspensa. Entre em contato com o suporte.' } })
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } })
    if (!admin) {
      return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
    }

    req.adminId = payload.sub
    req.adminEmail = payload.email
    req.tenantId = payload.tenantId
    req.tenantSlug = payload.tenantSlug
    next()
  })
}
