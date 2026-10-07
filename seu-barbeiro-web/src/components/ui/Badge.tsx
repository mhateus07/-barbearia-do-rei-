import type { AppointmentStatus } from '../../types'
import { getStatusConfig } from '../../utils/appointmentStatus'

/** Selo de status: a palavra e um ícone, nunca só a cor. */
export function Badge({ status }: { status: AppointmentStatus }) {
  const { label, color, bg, icon: Icon } = getStatusConfig(status)
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${bg} ${color}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  )
}
