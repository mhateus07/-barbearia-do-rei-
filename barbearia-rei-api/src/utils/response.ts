import { Response } from 'express'

export function success<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ data })
}

export function paginate<T>(
  res: Response,
  data: T[],
  meta: { total: number; page: number; limit: number },
) {
  return res.status(200).json({
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  })
}

export function apiError(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({ error: { message, details } })
}
