import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CalendarDays, CheckCircle2, XCircle, PlayCircle, Pencil } from 'lucide-react'
import { listAppointments, updateAppointmentStatus } from '../../api/appointments.api'
import { Badge } from '../../components/ui/Badge'
import { AppointmentFormModal } from './AppointmentFormModal'
import type { Appointment, AppointmentStatus } from '../../types'
import { formatTime } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

const STATUS_OPTIONS: { value: AppointmentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'IN_PROGRESS', label: 'Em atendimento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

const NEXT_STATUS: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string; icon: React.ElementType }>> = {
  SCHEDULED: { status: 'CONFIRMED', label: 'Confirmar', icon: CheckCircle2 },
  CONFIRMED: { status: 'IN_PROGRESS', label: 'Iniciar', icon: PlayCircle },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Concluir', icon: CheckCircle2 },
}

export function AppointmentsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', filterDate, filterStatus],
    queryFn: () => listAppointments({ date: filterDate, status: filterStatus || undefined }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })


  const appointments = data?.data ?? []

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-800">Agendamentos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{data?.meta.total ?? 0} resultado(s)</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-2.5 md:px-4 text-sm font-semibold text-white transition-colors shadow-sm shadow-amber-500/25 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-zinc-400 flex-shrink-0" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setFilterStatus(o.value as AppointmentStatus | '')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === o.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-zinc-400">
          <CalendarDays className="h-8 w-8 mb-3 text-zinc-300" />
          <p className="font-medium">Nenhum agendamento encontrado</p>
          <p className="text-sm mt-1">Tente mudar os filtros ou criar um novo agendamento</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {appointments.map((a: Appointment) => {
            const next = NEXT_STATUS[a.status]
            const NextIcon = next?.icon
            return (
              <div key={a.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 hover:shadow-sm transition-shadow">
                {/* Linha superior: hora + cliente + ações */}
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[46px]">
                    <p className="text-base font-bold text-amber-500 leading-none">{formatTime(a.startsAt)}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{formatTime(a.endsAt)}</p>
                  </div>

                  <div className="h-8 w-px bg-zinc-100 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-xs flex-shrink-0">
                        {a.client.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-zinc-800 text-sm truncate">{a.client.name}</p>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 ml-8 truncate">
                      {a.services.map((s) => s.service.name).join(' + ')} · {a.barber.name}
                    </p>
                  </div>

                  <Badge status={a.status} />
                </div>

                {/* Linha inferior: preço + botões de ação */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                  <p className="font-bold text-zinc-800 text-sm">{formatCurrency(Number(a.totalPrice))}</p>
                  <div className="flex items-center gap-1.5">
                    {next && NextIcon && (
                      <button
                        onClick={() => statusMutation.mutate({ id: a.id, status: next.status })}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                      >
                        <NextIcon className="h-3.5 w-3.5" />
                        {next.label}
                      </button>
                    )}
                    {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                      <>
                        <button
                          onClick={() => { setEditingAppointment(a); setModalOpen(true) }}
                          className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: a.id, status: 'CANCELLED' })}
                          className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Cancelar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AppointmentFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAppointment(null) }}
        defaultDate={`${filterDate}T08:00`}
        appointment={editingAppointment}
      />
    </div>
  )
}
