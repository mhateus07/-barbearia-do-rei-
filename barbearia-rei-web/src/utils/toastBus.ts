export type ToastVariant = 'error' | 'success'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

type Listener = (toast: ToastItem) => void

// Pub-sub simples fora da árvore React: precisamos disparar toasts a partir
// do onError global do React Query (definido junto com o QueryClient, fora
// de qualquer componente) e de qualquer lugar do código sem precisar de um
// hook de contexto disponível ali.
const listeners = new Set<Listener>()
let nextId = 1

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit(message: string, variant: ToastVariant) {
  const toast: ToastItem = { id: nextId++, message, variant }
  listeners.forEach((listener) => listener(toast))
}

export function showErrorToast(message: string) {
  emit(message, 'error')
}

export function showSuccessToast(message: string) {
  emit(message, 'success')
}
