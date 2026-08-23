import { isAxiosError } from 'axios'

const FALLBACK_MESSAGE = 'Algo deu errado. Tente novamente em instantes.'

/** Extrai uma mensagem amigável de um erro de API (`{ error: { message } }`) ou de um Error genérico. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.error?.message
    if (typeof message === 'string' && message.length > 0) return message
    if (error.code === 'ERR_NETWORK') return 'Não foi possível conectar ao servidor. Verifique sua internet.'
  }

  if (error instanceof Error && error.message) return error.message

  return FALLBACK_MESSAGE
}
