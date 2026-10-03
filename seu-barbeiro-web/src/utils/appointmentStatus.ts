import type { AppointmentStatus } from '../types'

interface StatusConfig {
  label: string
  color: string
  bg: string
}

export const statusConfig: Record<AppointmentStatus, StatusConfig> = {
  SCHEDULED: { label: 'Agendado', color: 'text-blue-700', bg: 'bg-blue-100' },
  CONFIRMED: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-100' },
  IN_PROGRESS: { label: 'Em atendimento', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  COMPLETED: { label: 'Concluído', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
  NO_SHOW: { label: 'Não compareceu', color: 'text-gray-700', bg: 'bg-gray-100' },
}

export function getStatusConfig(status: AppointmentStatus): StatusConfig {
  return statusConfig[status]
}
