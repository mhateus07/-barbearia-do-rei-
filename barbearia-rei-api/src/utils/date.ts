import { AppError } from '../lib/errors'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Valida e converte um parâmetro de data vindo de query string (filtros de
 * data/from/to). Sem essa checagem, uma string malformada (ex.: query param
 * manipulado manualmente) produz um `Invalid Date`, que o Prisma não sabe
 * serializar e derruba a rota com um erro não tratado (500 genérico) em vez
 * de uma resposta 400 clara.
 */
export function parseDateParam(value: string, field: string): Date {
  const isPlainDate = DATE_ONLY.test(value)
  const date = new Date(isPlainDate ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Parâmetro "${field}" não é uma data válida`, 400)
  }
  return date
}
