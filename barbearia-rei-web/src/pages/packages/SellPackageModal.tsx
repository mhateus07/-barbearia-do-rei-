import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { sellPackage } from '../../api/packages.api'
import { listClients } from '../../api/clients.api'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Package, PaymentMethod } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  pkg: Package | null
}

interface FormData {
  clientId: string
  method: PaymentMethod
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
}

export function SellPackageModal({ open, onClose, pkg }: Props) {
  const qc = useQueryClient()

  const { data: clientsData } = useQuery({ queryKey: ['clients', ''], queryFn: () => listClients() })
  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    reset({ clientId: '', method: 'CASH' })
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (d: FormData) => sellPackage({ clientId: d.clientId, packageId: pkg!.id, method: d.method }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['client-packages', created.id] })
      qc.invalidateQueries({ queryKey: ['finances'] })
      onClose()
    },
  })

  if (!pkg) return null

  return (
    <Modal open={open} onClose={onClose} title={`Vender "${pkg.name}"`}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm">
          <p className="text-amber-800">
            <strong>{pkg.totalSessions} sessões</strong> de {pkg.service.name}
            {pkg.validityDays ? ` · válido por ${pkg.validityDays} dias` : ''}
          </p>
          <p className="text-lg font-bold text-amber-700 mt-1">{formatCurrency(pkg.price)}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Cliente *</label>
          <select
            {...register('clientId', { required: 'Obrigatório' })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            <option value="">Selecione...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone}
              </option>
            ))}
          </select>
          {errors.clientId && <span className="text-xs text-red-500">{errors.clientId.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Forma de pagamento *</label>
          <select
            {...register('method', { required: true })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Confirmar Venda
          </Button>
        </div>
      </form>
    </Modal>
  )
}
