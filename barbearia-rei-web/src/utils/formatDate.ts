import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

// Pra datas "puras" (sem hora relevante, ex: data desejada da lista de
// espera) armazenadas como meia-noite UTC — extrai os dígitos direto da
// string ISO em vez de passar por um Date, que converteria pro fuso local e
// poderia exibir o dia errado (ex: meia-noite UTC vira 21h do dia anterior
// em fusos negativos).
export function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
