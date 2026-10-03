// Regras de negócio lançam `Error` simples; subclasses (Prisma, pg, etc.)
// carregam detalhes internos e nunca devem chegar ao cliente.
export function isBusinessError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    error.constructor === Error &&
    !('code' in error)
  )
}
