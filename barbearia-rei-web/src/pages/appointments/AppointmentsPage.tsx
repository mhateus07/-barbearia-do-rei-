import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAppointments, updateAppointmentStatus, deleteAppointment } from '../../api/appointments.api'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { AppointmentFormModal } from './AppointmentFormModal'
import type { Appointment, AppointmentStatus } from '../../types'
import { formatDateTime, formatTime } from '../../utils/formatDate'
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

const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  SCHEDULED: 'CONFIRMED',
  CONFIRMED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
}

export function AppointmentsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
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

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Agendamentos</h1>
          <p className="text-sm text-zinc-500">{data?.meta.total ?? 0} resultado(s)</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Novo Agendamento</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | '')}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Table
        loading={isLoading}
        keyExtractor={(a) => a.id}
        data={data?.data ?? []}
        emptyMessage="Nenhum agendamento encontrado para os filtros selecionados."
        columns={[
          {
            key: 'startsAt',
            header: 'Horário',
            render: (a: Appointment) => (
              <div>
                <p className="font-medium">{formatTime(a.startsAt)}</p>
                <p className="text-xs text-zinc-400">{formatTime(a.endsAt)}</p>
              </div>
            ),
          },
          { key: 'client', header: 'Cliente', render: (a: Appointment) => a.client.name },
          { key: 'barber', header: 'Barbeiro', render: (a: Appointment) => a.barber.name },
          {
            key: 'services',
            header: 'Serviços',
            render: (a: Appointment) => a.services.map((s) => s.service.name).join(', '),
          },
          {
            key: 'totalPrice',
            header: 'Valor',
            render: (a: Appointment) => formatCurrency(Number(a.totalPrice)),
          },
          {
            key: 'status',
            header: 'Status',
            render: (a: Appointment) => <Badge status={a.status} />,
          },
          {
            key: 'actions',
            header: 'Ações',
            render: (a: Appointment) => {
              const nextStatus = NEXT_STATUS[a.status]
              return (
                <div className="flex gap-1.5">
                  {nextStatus && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: a.id, status: nextStatus })}
                    >
                      {nextStatus === 'CONFIRMED' ? 'Confirmar' : nextStatus === 'IN_PROGRESS' ? 'Iniciar' : 'Concluir'}
                    </Button>
                  )}
                  {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: a.id, status: 'CANCELLED' })}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              )
            },
          },
        ]}
      />

      <AppointmentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={`${filterDate}T08:00`}
      />
    </div>
  )
}
