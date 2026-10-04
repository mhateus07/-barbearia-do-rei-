import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HandCoins, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { createAdvance, deleteAdvance, listOpenAdvances } from '../../api/advances.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const errorMessage = (error: unknown) =>
  (isAxiosError(error) && error.response?.data?.error?.message) ||
  'Não foi possível concluir.'

/** Vales em aberto e lançamento de novos vales. */
export function AdvancesPanel({
  barbers,
  open,
  onOpenChange,
  barberId,
}: {
  barbers: { barberId: string; barberName: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  barberId?: string
}) {
  const qc = useQueryClient()
  const { data: advances = [] } = useQuery({
    queryKey: ['advances', 'open'],
    queryFn: listOpenAdvances,
  })
  const [form, setForm] = useState({ barberId: '', amount: '', notes: '', fromCash: true })
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['advances'] })
    void qc.invalidateQueries({ queryKey: ['finances-commissions'] })
    void qc.invalidateQueries({ queryKey: ['cash'] })
  }
  const create = useMutation({
    mutationFn: createAdvance,
    onSuccess: () => {
      toast.success('Vale registrado.')
      refresh()
      onOpenChange(false)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: deleteAdvance,
    onSuccess: () => {
      toast.success('Vale removido.')
      refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const selected = form.barberId || barberId || ''

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900">Vales em aberto</h3>
          <p className="text-xs text-zinc-500">
            Descontados automaticamente no próximo pagamento de comissão.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onOpenChange(true)}>
          <HandCoins className="h-4 w-4" /> Dar vale
        </Button>
      </div>
      {advances.length ? (
        <ul className="divide-y divide-zinc-100">
          {advances.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-zinc-800">{a.barber.name}</p>
                <p className="truncate text-xs text-zinc-500">
                  {formatDate(a.givenAt)}
                  {a.notes ? ` · ${a.notes}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular font-semibold text-red-600">
                  {formatCurrency(Number(a.amount))}
                </span>
                <button
                  aria-label="Remover vale"
                  onClick={() => remove.mutate(a.id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-zinc-400">Nenhum vale em aberto.</p>
      )}

      <Modal open={open} onClose={() => onOpenChange(false)} title="Dar vale (adiantamento)">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate({
              barberId: selected,
              amount: Number(form.amount),
              notes: form.notes || undefined,
              fromCash: form.fromCash,
            })
          }}
        >
          <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
            Profissional
            <select
              required
              value={selected}
              onChange={(e) => setForm({ ...form, barberId: e.target.value })}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900"
            >
              <option value="">Selecione</option>
              {barbers.map((b) => (
                <option key={b.barberId} value={b.barberId}>
                  {b.barberName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
            Valor (R$)
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
            Observação (opcional)
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex.: adiantamento da quinzena"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.fromCash}
              onChange={(e) => setForm({ ...form, fromCash: e.target.checked })}
            />
            Saiu do dinheiro do caixa (lança uma sangria)
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending}>
              Registrar vale
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
