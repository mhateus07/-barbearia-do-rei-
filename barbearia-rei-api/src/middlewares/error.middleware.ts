import { Request, Response, NextFunction } from 'express'

export function errorMiddleware(err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) {
  // Erros do body-parser (JSON malformado, corpo grande demais) já trazem status 4xx.
  if (err.status && err.status >= 400 && err.status < 500)
    return res.status(err.status).json({ error: { message: 'Requisição inválida' } })
  console.error(err)
  res.status(500).json({ error: { message: 'Erro interno do servidor' } })
}
