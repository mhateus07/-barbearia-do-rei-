import type { AppointmentStatus } from '../../types'
import { getStatusConfig } from '../../utils/appointmentStatus'

export function Badge({ status }: { status: AppointmentStatus }) {
  const { label, color, bg } = getStatusConfig(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${color}`}>
      {label}
    </span>
  )
}
