import type { Agenda } from './OperationsPage'

export const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em atendimento',
  COMPLETED: 'Concluído',
}

export const statusStyles: Record<string, string> = {
  SCHEDULED: 'border-amber-200 bg-amber-100 hover:border-amber-300',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 hover:border-emerald-300',
  IN_PROGRESS: 'border-yellow-700/30 bg-yellow-100 hover:border-yellow-700/50',
  COMPLETED: 'border-zinc-200 bg-zinc-100 hover:border-zinc-300',
}

export const statusDots: Record<string, string> = {
  SCHEDULED: 'bg-amber-100 ring-1 ring-amber-300',
  CONFIRMED: 'bg-emerald-50 ring-1 ring-emerald-300',
  IN_PROGRESS: 'bg-yellow-100 ring-1 ring-yellow-700/40',
  COMPLETED: 'bg-zinc-100 ring-1 ring-zinc-300',
}

const PALETTE = [
  '#3e6aa8',
  '#2a8256',
  '#c0782a',
  '#7a5ca8',
  '#b83a1e',
  '#2b8a8f',
  '#8a90a0',
  '#15233f',
]

/** Cor fixa por profissional, na ordem em que aparecem na agenda. */
export const barberColor = (agenda: Agenda, barberId: string) =>
  PALETTE[
    Math.max(
      0,
      agenda.barbers.findIndex((b) => b.id === barberId),
    ) % PALETTE.length
  ]
