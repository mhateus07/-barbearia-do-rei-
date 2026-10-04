import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { Crown, Link2, QrCode } from 'lucide-react'
import {
  applySubscription,
  getAppointmentSubscription,
  removeSubscription,
} from '../../api/subscriptions.api'
import { getSalon } from '../../api/salon'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Appointment } from './OperationsPage'

const errorMessage = (error: unknown) =>
  (isAxiosError(error) && error.response?.data?.error?.message) ||
  'Não foi possível concluir.'

/** Sinal Pix, link do cliente e assinatura, no painel do atendimento. */
export function AppointmentExtras({ appointment: a }: { appointment: Appointment }) {
  const qc = useQueryClient()
  const { data: sub } = useQuery({
    queryKey: ['appointment-subscription', a.id],
    queryFn: () => getAppointmentSubscription(a.id),
  })
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['appointment-subscription', a.id] })
    void qc.invalidateQueries({ queryKey: ['operations-agenda'] })
  }
  const apply = useMutation({
    mutationFn: () => (sub?.applied ? removeSubscription(a.id) : applySubscription(a.id)),
    onSuccess: () => {
      toast.success(sub?.applied ? 'Assinatura removida da comanda.' : 'Assinatura aplicada na comanda.')
      refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const depositPending = a.depositAmount && !a.depositPaidAt
  const open = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/meu-horario/${a.manageToken}?salon=${encodeURIComponent(getSalon())}`,
      )
      toast.success('Link do cliente copiado. Envie pelo WhatsApp.')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  if (!a.depositAmount && !a.manageToken && !sub) return null
  return (
    <div className="space-y-2">
      {a.depositAmount && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${depositPending ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
        >
          <QrCode className="h-4 w-4 shrink-0" />
          {depositPending
            ? `Aguardando sinal de ${formatCurrency(Number(a.depositAmount))} até ${new Date(a.depositExpiresAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : `Sinal de ${formatCurrency(Number(a.depositAmount))} pago por Pix`}
        </div>
      )}
      {sub && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-amber-900">
            <Crown className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="truncate">
              Assinante · {sub.plan}
              {sub.usesPerCycle ? ` · ${sub.uses}/${sub.usesPerCycle} usos` : ''}
            </span>
          </span>
          {open && (
            <button
              disabled={apply.isPending}
              onClick={() => apply.mutate()}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${sub.applied ? 'text-amber-800 hover:underline' : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'}`}
            >
              {sub.applied ? 'Remover' : 'Usar assinatura'}
            </button>
          )}
        </div>
      )}
      {a.manageToken && open && (
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          <Link2 className="h-3.5 w-3.5" /> Copiar link do cliente (confirmar, remarcar, cancelar)
        </button>
      )}
    </div>
  )
}
