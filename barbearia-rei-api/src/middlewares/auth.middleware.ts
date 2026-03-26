import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'

export interface AuthRequest extends Request {
  adminId?: string
  adminEmail?: string
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
    return next()
  } catch {
    return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
  }
}
