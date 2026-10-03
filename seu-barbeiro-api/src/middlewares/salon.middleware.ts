import { Request, Response, NextFunction } from 'express'
import { salons, salonContext } from '../lib/prisma'
export function salonMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const slug =
    req.header('X-Salon') || process.env.DEFAULT_SALON || 'seu-barbeiro'
  const salon = salons.get(slug)
  if (!salon)
    return res.status(404).json({ error: { message: 'Salão não encontrado' } })
  return salonContext.run(salon, next)
}
