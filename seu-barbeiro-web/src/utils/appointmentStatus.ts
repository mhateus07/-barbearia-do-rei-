import { CalendarClock, CheckCheck, CircleCheck, Scissors, UserX, XCircle, type LucideIcon } from 'lucide-react'
import type { AppointmentStatus } from '../types'

interface StatusConfig {
  label: string
  color: string
  bg: string
  icon: LucideIcon
}

export const statusConfig: Record<AppointmentStatus, StatusConfig> = {
  SCHEDULED: { label: 'Agendado', color: 'text-sky-700', bg: 'bg-sky-100', icon: CalendarClock },
  CONFIRMED: { label: 'Confirmado', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CircleCheck },
  IN_PROGRESS: { label: 'Em atendimento', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Scissors },
  COMPLETED: { label: 'Concluído', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCheck },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
  NO_SHOW: { label: 'Faltou', color: 'text-red-700', bg: 'bg-red-50', icon: UserX },
}

export function getStatusConfig(status: AppointmentStatus): StatusConfig {
  return statusConfig[status]
}
