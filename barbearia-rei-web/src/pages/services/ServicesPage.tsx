import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listServices, deleteService } from '../../api/services.api'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { ServiceFormModal } from './ServiceFormModal'
import type { Service } from '../../types'
import { formatCurrency } from '../../utils/formatCurrency'

export function ServicesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => listServices(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Serviços</h1>
          <p className="text-sm text-zinc-500">{data.length} cadastrado(s)</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Novo Serviço</Button>
      </div>

      <Table
        loading={isLoading}
        keyExtractor={(s) => s.id}
        data={data}
        columns={[
          { key: 'name', header: 'Nome' },
          { key: 'description', header: 'Descrição', render: (s) => s.description || '—' },
          { key: 'price', header: 'Preço', render: (s) => formatCurrency(Number(s.price)) },
          { key: 'durationMin', header: 'Duração', render: (s) => `${s.durationMin} min` },
          {
            key: 'isActive',
            header: 'Status',
            render: (s) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.isActive ? 'Ativo' : 'Inativo'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Ações',
            render: (s) => (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setEditing(s); setModalOpen(true) }}>Editar</Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteMutation.isPending}
                  onClick={() => { if (confirm(`Desativar "${s.name}"?`)) deleteMutation.mutate(s.id) }}
                >
                  Desativar
                </Button>
              </div>
            ),
          },
        ]}
      />

      <ServiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} service={editing} />
    </div>
  )
}
