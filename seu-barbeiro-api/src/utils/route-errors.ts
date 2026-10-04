import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { isBusinessError } from './http-error'

/** Erros de validação e de regra de negócio viram 400 com mensagem amigável. */
export function businessErrors(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof z.ZodError)
    return res.status(400).json({
      error: { message: error.issues.map((i) => i.message).join('; ') },
    })
  if (isBusinessError(error))
    return res.status(400).json({ error: { message: error.message } })
  console.error(error)
  res.status(400).json({ error: { message: 'Não foi possível concluir a operação' } })
}
