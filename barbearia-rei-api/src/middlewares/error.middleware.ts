import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message } })
  }

  // Erro inesperado (bug, exceção nativa do Prisma, etc): logado por completo
  // no servidor, mas nunca repassado ao cliente — pode conter detalhes
  // internos (nomes de tabela/coluna, stack trace).
  console.error(err)
  res.status(500).json({ error: { message: 'Erro interno do servidor' } })
}
