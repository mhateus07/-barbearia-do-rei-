import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBarbers, deleteBarber } from '../../api/barbers.api'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { BarberFormModal } from './BarberFormModal'
import type { Barber } from '../../types'

export function BarbersPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Barber | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: () => listBarbers(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBarber,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbers'] }),
  })

  function handleEdit(barber: Barber) {
    setEditing(barber)
    setModalOpen(true)
  }

  function handleNew() {
    setEditing(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Barbeiros</h1>
          <p className="text-sm text-zinc-500">{data.length} cadastrado(s)</p>
        </div>
        <Button onClick={handleNew}>+ Novo Barbeiro</Button>
      </div>

      <Table
        loading={isLoading}
        keyExtractor={(b) => b.id}
        data={data}
        columns={[
          { key: 'name', header: 'Nome' },
          { key: 'phone', header: 'Telefone', render: (b) => b.phone || '—' },
          { key: 'email', header: 'E-mail', render: (b) => b.email || '—' },
          {
            key: 'isActive',
            header: 'Status',
            render: (b) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {b.isActive ? 'Ativo' : 'Inativo'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Ações',
            render: (b) => (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(b)}>Editar</Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`Desativar ${b.name}?`)) deleteMutation.mutate(b.id)
                  }}
                >
                  Desativar
                </Button>
              </div>
            ),
          },
        ]}
      />

      <BarberFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        barber={editing}
      />
    </div>
  )
}
