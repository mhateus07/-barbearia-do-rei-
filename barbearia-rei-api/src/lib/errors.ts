// Erro "esperado", com mensagem segura pra mostrar ao cliente (regra de
// negócio, validação, recurso não encontrado etc). Qualquer erro que não for
// uma AppError é tratado como falha inesperada pelo errorMiddleware: logado
// por completo no servidor, mas exposto ao cliente só como mensagem genérica.
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}
