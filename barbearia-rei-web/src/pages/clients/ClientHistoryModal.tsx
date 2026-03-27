import { useQuery } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { listAppointments } from '../../api/appointments.api'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Client } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  client: Client | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function ClientHistoryModal({ open, onClose, client }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['client-history', client?.id],
    queryFn: () => listAppointments({ clientId: client!.id, limit: 100 }),
    enabled: open && !!client,
  })

  const appointments = data?.data ?? []
  const completed = appointments.filter((a) => a.status === 'COMPLETED')
  const totalSpent = completed.reduce((sum, a) => sum + Number(a.totalPrice), 0)

  return (
    <Modal open={open} onClose={onClose} title={`Histórico — ${client?.name ?? ''}`} size="lg">
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{appointments.length}</p>
              <p className="text-xs text-amber-700 mt-0.5">Agendamentos</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{completed.length}</p>
              <p className="text-xs text-green-700 mt-0.5">Concluídos</p>
            </div>
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-center">
              <p className="text-xl font-bold text-zinc-800">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Total gasto</p>
            </div>
          </div>

          {/* Lista */}
          {appointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Nenhum atendimento registrado.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div className="min-w-[80px]">
                    <p className="text-xs font-semibold text-zinc-700">{formatDate(a.startsAt)}</p>
                    <p className="text-xs text-zinc-400">{formatTime(a.startsAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {a.services.map((s) => s.service.name).join(' + ')}
                    </p>
                    <p className="text-xs text-zinc-400">{a.barber.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-semibold text-zinc-700">{formatCurrency(Number(a.totalPrice))}</span>
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
