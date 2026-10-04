import type { Agenda } from './OperationsPage'

export const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em atendimento',
  COMPLETED: 'Concluído',
}

export const statusStyles: Record<string, string> = {
  SCHEDULED: 'border-l-amber-500 bg-amber-50 hover:bg-amber-100',
  CONFIRMED: 'border-l-sky-500 bg-sky-50 hover:bg-sky-100',
  IN_PROGRESS: 'border-l-violet-500 bg-violet-50 hover:bg-violet-100',
  COMPLETED: 'border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100',
}

export const statusDots: Record<string, string> = {
  SCHEDULED: 'bg-amber-500',
  CONFIRMED: 'bg-sky-500',
  IN_PROGRESS: 'bg-violet-500',
  COMPLETED: 'bg-emerald-500',
}

const PALETTE = [
  '#f59e0b',
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#f43f5e',
  '#14b8a6',
  '#f97316',
  '#6366f1',
]

/** Cor fixa por profissional, na ordem em que aparecem na agenda. */
export const barberColor = (agenda: Agenda, barberId: string) =>
  PALETTE[
    Math.max(
      0,
      agenda.barbers.findIndex((b) => b.id === barberId),
    ) % PALETTE.length
  ]
