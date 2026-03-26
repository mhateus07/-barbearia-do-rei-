import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listClients, deleteClient } from '../../api/clients.api'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ClientFormModal } from './ClientFormModal'
import type { Client } from '../../types'

export function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => listClients(search || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Clientes</h1>
          <p className="text-sm text-zinc-500">{data?.meta.total ?? 0} cadastrado(s)</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Novo Cliente</Button>
      </div>

      <Input
        placeholder="Buscar por nome ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Table
        loading={isLoading}
        keyExtractor={(c) => c.id}
        data={data?.data ?? []}
        columns={[
          { key: 'name', header: 'Nome' },
          { key: 'phone', header: 'Telefone' },
          { key: 'email', header: 'E-mail', render: (c) => c.email || '—' },
          { key: 'notes', header: 'Obs.', render: (c) => c.notes ? c.notes.slice(0, 40) + (c.notes.length > 40 ? '...' : '') : '—' },
          {
            key: 'actions',
            header: 'Ações',
            render: (c) => (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setEditing(c); setModalOpen(true) }}>Editar</Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteMutation.isPending}
                  onClick={() => { if (confirm(`Excluir ${c.name}?`)) deleteMutation.mutate(c.id) }}
                >
                  Excluir
                </Button>
              </div>
            ),
          },
        ]}
      />

      <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} client={editing} />
    </div>
  )
}
