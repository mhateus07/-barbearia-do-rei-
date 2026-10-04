import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Lock,
  LockOpen,
  Landmark,
} from 'lucide-react'
import {
  addCashMovement,
  closeCash,
  getCashHistory,
  getCurrentCash,
  openCash,
} from '../../api/cash.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/formatCurrency'

const methodLabels: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
}
const errorMessage = (error: unknown) =>
  (isAxiosError(error) && error.response?.data?.error?.message) ||
  'Não foi possível concluir.'
const dateTime = (value: string) =>
  new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function CashPage() {
  const qc = useQueryClient()
  const { data: cash, isLoading } = useQuery({
    queryKey: ['cash', 'current'],
    queryFn: getCurrentCash,
    refetchInterval: 30000,
  })
  const { data: history = [] } = useQuery({
    queryKey: ['cash', 'history'],
    queryFn: getCashHistory,
  })
  const [opening, setOpening] = useState('')
  const [movement, setMovement] = useState<'SUPPLY' | 'WITHDRAWAL' | null>(null)
  const [moveForm, setMoveForm] = useState({ amount: '', reason: '' })
  const [closing, setClosing] = useState(false)
  const [counted, setCounted] = useState('')
  const [notes, setNotes] = useState('')
  const refresh = () => qc.invalidateQueries({ queryKey: ['cash'] })

  const open = useMutation({
    mutationFn: () => openCash(Number(opening || 0)),
    onSuccess: () => {
      toast.success('Caixa aberto.')
      setOpening('')
      void refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const move = useMutation({
    mutationFn: () =>
      addCashMovement({
        kind: movement!,
        amount: Number(moveForm.amount),
        reason: moveForm.reason,
      }),
    onSuccess: () => {
      toast.success(movement === 'SUPPLY' ? 'Reforço lançado.' : 'Sangria lançada.')
      setMovement(null)
      setMoveForm({ amount: '', reason: '' })
      void refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const close = useMutation({
    mutationFn: () => closeCash({ countedAmount: Number(counted || 0), notes: notes || undefined }),
    onSuccess: (result) => {
      const diff = result.difference ?? 0
      toast.success(
        Math.abs(diff) < 0.005
          ? 'Caixa fechado. Conferência sem diferença.'
          : `Caixa fechado com ${diff > 0 ? 'sobra' : 'falta'} de ${formatCurrency(Math.abs(diff))}.`,
      )
      setClosing(false)
      setCounted('')
      setNotes('')
      void refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const difference = cash && counted !== '' ? Number(counted) - cash.expected : null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 md:text-3xl">Caixa</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Abertura, sangrias, reforços e conferência do dinheiro na gaveta.
          </p>
        </div>
        {cash && (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setMovement('SUPPLY')} className="border border-zinc-200 bg-white">
              <ArrowDownCircle className="h-4 w-4 text-emerald-600" /> Reforço
            </Button>
            <Button variant="ghost" onClick={() => setMovement('WITHDRAWAL')} className="border border-zinc-200 bg-white">
              <ArrowUpCircle className="h-4 w-4 text-red-600" /> Sangria
            </Button>
            <Button variant="secondary" onClick={() => setClosing(true)}>
              <Lock className="h-4 w-4" /> Fechar caixa
            </Button>
          </div>
        )}
      </header>

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : !cash ? (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-soft">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-100 blur-2xl" aria-hidden />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-900 text-amber-400">
                <Landmark className="h-7 w-7" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-zinc-900">Caixa fechado</p>
                <p className="text-sm text-zinc-500">Informe o troco que está na gaveta para começar o dia.</p>
              </div>
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                open.mutate()
              }}
            >
              <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
                Troco inicial (R$)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={opening}
                  onChange={(e) => setOpening(e.target.value)}
                  placeholder="0,00"
                  className="w-36"
                />
              </label>
              <Button type="submit" loading={open.isPending}>
                <LockOpen className="h-4 w-4" /> Abrir caixa
              </Button>
            </form>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 p-6 text-neutral-50 ring-1 ring-neutral-800 shadow-lift">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" aria-hidden />
              <p className="flex items-center gap-2 text-sm text-neutral-400">
                <Banknote className="h-4 w-4 text-amber-400" /> Dinheiro esperado na gaveta
              </p>
              <p className="tabular mt-2 font-display text-4xl font-extrabold">{formatCurrency(cash.expected)}</p>
              <p className="mt-1 text-xs text-neutral-500">Aberto em {dateTime(cash.openedAt)}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  ['Troco inicial', cash.openingAmount],
                  ['Entradas', cash.cashIn - cash.cashRefunds],
                  ['Reforços', cash.supplies],
                  ['Sangrias', -cash.withdrawals],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-xl bg-neutral-50/5 p-3">
                    <dt className="text-xs text-neutral-400">{label}</dt>
                    <dd className="tabular font-semibold">{formatCurrency(value as number)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Recebido desde a abertura
              </p>
              <ul className="mt-3 space-y-2.5">
                {Object.keys(methodLabels).map((m) => (
                  <li key={m} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">{methodLabels[m]}</span>
                    <span className="tabular font-semibold text-zinc-900">
                      {formatCurrency(cash.byMethod[m] ?? 0)}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between border-t border-zinc-100 pt-2.5 text-sm font-bold">
                  <span className="text-zinc-800">Total</span>
                  <span className="tabular text-zinc-900">
                    {formatCurrency(Object.values(cash.byMethod).reduce((a, b) => a + b, 0))}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white shadow-soft">
            <h2 className="border-b border-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-800">
              Movimentações do caixa
            </h2>
            {cash.movements.length ? (
              <ul className="divide-y divide-zinc-100">
                {cash.movements.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {m.kind === 'SUPPLY' ? (
                        <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-zinc-800">{m.reason}</p>
                        <p className="text-xs text-zinc-500">
                          {m.kind === 'SUPPLY' ? 'Reforço' : 'Sangria'} · {dateTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`tabular font-semibold ${m.kind === 'SUPPLY' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.kind === 'SUPPLY' ? '+' : '−'} {formatCurrency(Number(m.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-zinc-400">Nenhuma sangria ou reforço ainda.</p>
            )}
          </section>
        </>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-soft">
        <h2 className="border-b border-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-800">
          Fechamentos anteriores
        </h2>
        {history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">Período</th>
                  <th className="px-5 py-2.5 text-right font-medium">Esperado</th>
                  <th className="px-5 py-2.5 text-right font-medium">Contado</th>
                  <th className="px-5 py-2.5 text-right font-medium">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-5 py-3 text-zinc-700">
                      {dateTime(h.openedAt)} → {new Date(h.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {h.notes && <p className="text-xs text-zinc-400">{h.notes}</p>}
                    </td>
                    <td className="tabular px-5 py-3 text-right">{formatCurrency(h.expectedAmount)}</td>
                    <td className="tabular px-5 py-3 text-right">{formatCurrency(h.countedAmount)}</td>
                    <td
                      className={`tabular px-5 py-3 text-right font-semibold ${
                        Math.abs(h.difference) < 0.005 ? 'text-zinc-500' : h.difference > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(h.difference) < 0.005 ? 'OK' : formatCurrency(h.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-zinc-400">Nenhum caixa fechado ainda.</p>
        )}
      </section>

      <Modal
        open={!!movement}
        onClose={() => setMovement(null)}
        title={movement === 'SUPPLY' ? 'Reforço (entrada de troco)' : 'Sangria (retirada)'}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            move.mutate()
          }}
        >
          <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
            Valor (R$)
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={moveForm.amount}
              onChange={(e) => setMoveForm({ ...moveForm, amount: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
            Motivo
            <Input
              required
              minLength={2}
              value={moveForm.reason}
              onChange={(e) => setMoveForm({ ...moveForm, reason: e.target.value })}
              placeholder={movement === 'SUPPLY' ? 'Ex.: troco do banco' : 'Ex.: compra de material, depósito'}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setMovement(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={move.isPending}>
              Lançar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={closing} onClose={() => setClosing(false)} title="Fechar caixa">
        {cash && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              close.mutate()
            }}
          >
            <div className="rounded-xl bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Dinheiro esperado</span>
                <strong className="tabular text-zinc-900">{formatCurrency(cash.expected)}</strong>
              </div>
            </div>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
              Quanto tem na gaveta? (R$)
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={counted}
                onChange={(e) => setCounted(e.target.value)}
                autoFocus
              />
            </label>
            {difference !== null && (
              <p
                className={`rounded-xl p-3 text-sm font-semibold ${
                  Math.abs(difference) < 0.005
                    ? 'bg-emerald-50 text-emerald-700'
                    : difference > 0
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-red-50 text-red-700'
                }`}
              >
                {Math.abs(difference) < 0.005
                  ? 'Confere certinho.'
                  : `${difference > 0 ? 'Sobra' : 'Falta'} de ${formatCurrency(Math.abs(difference))}`}
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600">
              Observação (opcional)
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setClosing(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="secondary" loading={close.isPending}>
                Fechar caixa
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
