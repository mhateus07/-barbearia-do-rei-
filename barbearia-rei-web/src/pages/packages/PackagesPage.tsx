import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, PackageIcon, Layers, ShoppingCart } from 'lucide-react'
import { listPackages, deactivatePackage } from '../../api/packages.api'
import { PackageFormModal } from './PackageFormModal'
import { SellPackageModal } from './SellPackageModal'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Package } from '../../types'

export function PackagesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [selling, setSelling] = useState<Package | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => listPackages(),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivatePackage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Pacotes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Sessões pré-pagas — cliente compra adiantado, consome no agendamento
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shadow-amber-500/25 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Novo Pacote
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-zinc-400">
          <Layers className="h-8 w-8 mb-3 text-zinc-300" />
          <p className="font-medium">Nenhum pacote cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                  <PackageIcon className="h-4 w-4 text-amber-500" />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pkg.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
                >
                  {pkg.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="font-semibold text-zinc-800 mb-1">{pkg.name}</p>
              <p className="text-xs text-zinc-400 mb-3">
                {pkg.totalSessions}× {pkg.service.name}
                {pkg.validityDays ? ` · válido ${pkg.validityDays}d` : ' · sem validade'}
              </p>
              <span className="text-lg font-bold text-amber-600">{formatCurrency(pkg.price)}</span>

              <div className="flex gap-2 border-t border-zinc-100 pt-4 mt-4">
                {pkg.isActive && (
                  <button
                    onClick={() => setSelling(pkg)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Vender
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditing(pkg)
                    setModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                {pkg.isActive && (
                  <button
                    onClick={() => {
                      if (confirm(`Desativar "${pkg.name}"?`)) deactivateMutation.mutate(pkg.id)
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors ml-auto"
                  >
                    Desativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PackageFormModal open={modalOpen} onClose={() => setModalOpen(false)} pkg={editing} />
      <SellPackageModal open={!!selling} onClose={() => setSelling(null)} pkg={selling} />
    </div>
  )
}
