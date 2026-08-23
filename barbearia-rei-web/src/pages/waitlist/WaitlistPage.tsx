import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, CheckCheck, Hourglass, Phone } from 'lucide-react'
import { listWaitlist, updateWaitlistStatus, deleteWaitlistEntry } from '../../api/waitlist.api'
import { formatDateOnly } from '../../utils/formatDate'
import { WaitlistFormModal } from './WaitlistFormModal'
import type { WaitlistEntry, WaitlistStatus } from '../../types'

const STATUS_FILTERS: { value: WaitlistStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'WAITING', label: 'Aguardando' },
  { value: 'NOTIFIED', label: 'Avisados' },
  { value: 'CONVERTED', label: 'Agendados' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

const STATUS_BADGE: Record<WaitlistStatus, string> = {
  WAITING: 'bg-zinc-100 text-zinc-600',
  NOTIFIED: 'bg-blue-50 text-blue-600 border border-blue-100',
  CONVERTED: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-500 border border-red-100',
}

const STATUS_LABEL: Record<WaitlistStatus, string> = {
  WAITING: 'Aguardando',
  NOTIFIED: 'Avisado',
  CONVERTED: 'Agendado',
  CANCELLED: 'Cancelado',
}

function StatusBadge({ status }: { status: WaitlistStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function RowActions({ entry }: { entry: WaitlistEntry }) {
  const qc = useQueryClient()

  const convertMutation = useMutation({
    mutationFn: () => updateWaitlistStatus(entry.id, 'CONVERTED'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlist'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWaitlistEntry(entry.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlist'] }),
  })

  return (
    <div className="flex items-center gap-1">
      {(entry.status === 'WAITING' || entry.status === 'NOTIFIED') && (
        <button
          onClick={() => convertMutation.mutate()}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          title="Marcar como agendado"
          aria-label={`Marcar ${entry.client.name} como agendado`}
        >
          <CheckCheck className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={() => {
          if (confirm(`Remover ${entry.client.name} da lista de espera?`)) deleteMutation.mutate()
        }}
        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Remover"
        aria-label={`Remover ${entry.client.name} da lista de espera`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function WaitlistPage() {
  const [status, setStatus] = useState<WaitlistStatus | ''>('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['waitlist', status],
    queryFn: () => listWaitlist(status || undefined),
  })

  const entries = data?.data ?? []

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-800">Lista de Espera</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Avisa o cliente automaticamente por WhatsApp quando um horário abre por cancelamento
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-2.5 md:px-4 text-sm font-semibold text-white transition-colors shadow-sm shadow-amber-500/25 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Filtro de status */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              status === f.value
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-zinc-400">
          <Hourglass className="h-8 w-8 mb-3 text-zinc-300" />
          <p className="font-medium">Ninguém na lista de espera</p>
        </div>
      ) : (
        <>
          {/* Tabela — desktop */}
          <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Cliente
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Data desejada
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Barbeiro
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Serviço
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-800 text-sm">{entry.client.name}</span>
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <Phone className="h-3 w-3" />
                            {entry.client.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-600">{formatDateOnly(entry.preferredDate)}</td>
                      <td className="px-5 py-3.5 text-sm text-zinc-600">
                        {entry.barber?.name ?? <span className="text-zinc-300">Qualquer</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-600">
                        {entry.service?.name ?? <span className="text-zinc-300">Qualquer</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <RowActions entry={entry} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">{entry.client.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {entry.client.phone}
                    </div>
                  </div>
                  <RowActions entry={entry} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 pt-1 border-t border-zinc-100">
                  <span>{formatDateOnly(entry.preferredDate)}</span>
                  <span>·</span>
                  <span>{entry.barber?.name ?? 'Qualquer barbeiro'}</span>
                  <span>·</span>
                  <span>{entry.service?.name ?? 'Qualquer serviço'}</span>
                  <StatusBadge status={entry.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <WaitlistFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
