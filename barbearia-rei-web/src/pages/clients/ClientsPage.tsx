import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Users, Search, Phone, Mail, History } from 'lucide-react'
import { listClients, deleteClient } from '../../api/clients.api'
import { ClientFormModal } from './ClientFormModal'
import { ClientHistoryModal } from './ClientHistoryModal'
import type { Client } from '../../types'

export function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [historyClient, setHistoryClient] = useState<Client | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => listClients(search || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const clients = data?.data ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{data?.meta.total ?? 0} cadastrado(s)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shadow-amber-500/25"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-zinc-400">
          <Users className="h-8 w-8 mb-3 text-zinc-300" />
          <p className="font-medium">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Cliente</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Contato</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Observações</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-sm flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-800 text-sm">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Phone className="h-3 w-3" />{client.phone}
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Mail className="h-3 w-3" />{client.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-zinc-400">{client.notes ? client.notes.slice(0, 50) + (client.notes.length > 50 ? '...' : '') : '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setHistoryClient(client)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Histórico">
                        <History className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { setEditing(client); setModalOpen(true) }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { if (confirm(`Excluir ${client.name}?`)) deleteMutation.mutate(client.id) }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Excluir">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} client={editing} />
      <ClientHistoryModal open={!!historyClient} onClose={() => setHistoryClient(null)} client={historyClient} />
    </div>
  )
}
