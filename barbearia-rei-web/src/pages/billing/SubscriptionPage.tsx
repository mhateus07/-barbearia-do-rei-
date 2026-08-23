import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, QrCode, Copy, Check, XCircle, Clock } from 'lucide-react'
import {
  getSubscription,
  getSubscriptionPayments,
  startCardCheckout,
  startPixCheckout,
  cancelSubscription,
} from '../../api/billing.api'
import type { BillingMethod, SubscriptionPaymentStatus, SubscriptionStatus } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatCurrency'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { showErrorToast, showSuccessToast } from '../../utils/toastBus'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

const SUBSCRIPTION_STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string }> = {
  PENDING_SETUP: { label: 'Configure o pagamento', color: 'bg-zinc-100 text-zinc-600' },
  ACTIVE: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
  PAST_DUE: { label: 'Pagamento pendente', color: 'bg-amber-100 text-amber-700' },
  CANCELED: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
}

const PAYMENT_STATUS_CONFIG: Record<SubscriptionPaymentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-700' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-zinc-100 text-zinc-600' },
}

const METHOD_LABELS: Record<BillingMethod, string> = {
  CARD: 'Cartão de Crédito',
  PIX: 'Pix',
}

export function SubscriptionPage() {
  const qc = useQueryClient()
  const [pixModalOpen, setPixModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
    // Só faz polling enquanto aguarda confirmação de um pagamento — assim
    // que o webhook processar e o status virar ACTIVE/PAST_DUE, o polling
    // para sozinho.
    refetchInterval: (query) => (query.state.data?.status === 'PENDING_SETUP' ? 5000 : false),
  })

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['subscription-payments'],
    queryFn: getSubscriptionPayments,
  })

  const cardMutation = useMutation({
    mutationFn: startCardCheckout,
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl
    },
    onError: (err) => showErrorToast(getErrorMessage(err)),
  })

  const pixMutation = useMutation({
    mutationFn: startPixCheckout,
    onSuccess: () => {
      setPixModalOpen(true)
      qc.invalidateQueries({ queryKey: ['subscription'] })
      qc.invalidateQueries({ queryKey: ['subscription-payments'] })
    },
    onError: (err) => showErrorToast(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      showSuccessToast('Assinatura cancelada.')
      qc.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (err) => showErrorToast(getErrorMessage(err)),
  })

  // O modal do Pix só fica visível enquanto a assinatura ainda não foi
  // confirmada — assim que o webhook processar o pagamento, ele some
  // sozinho no próximo refetch, sem precisar de um efeito pra fechá-lo.
  const pixModalVisible = pixModalOpen && subscription?.status === 'PENDING_SETUP'

  const pendingPixPayment = subscription?.payments?.find((p) => p.status === 'PENDING' && p.method === 'PIX')

  function copyPixCode() {
    if (!pendingPixPayment?.pixCopyPaste) return
    navigator.clipboard.writeText(pendingPixPayment.pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const statusCfg = subscription ? SUBSCRIPTION_STATUS_CONFIG[subscription.status] : null
  const needsSetup = !subscription || subscription.status === 'PENDING_SETUP'

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-800">Assinatura</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Cobrança da plataforma sobre a sua barbearia</p>
      </div>

      {/* Status atual */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">
                {formatCurrency(subscription?.amount ?? 0)} / mês
              </p>
              <p className="text-xs text-zinc-500">
                {subscription?.method
                  ? METHOD_LABELS[subscription.method]
                  : 'Forma de pagamento não definida'}
              </p>
            </div>
          </div>
          {statusCfg && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
          )}
        </div>

        {!needsSetup && subscription?.nextDueDate && (
          <p className="mt-3 text-xs text-zinc-500">
            Próxima cobrança: {formatDate(subscription.nextDueDate)}
          </p>
        )}

        {!needsSetup && subscription?.status !== 'CANCELED' && (
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <Button
              variant="danger"
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (confirm('Cancelar a assinatura? Você perderá acesso automático a renovações futuras.')) {
                  cancelMutation.mutate()
                }
              }}
            >
              <XCircle className="h-4 w-4" />
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar assinatura'}
            </Button>
          </div>
        )}
      </div>

      {/* Escolha de forma de pagamento */}
      {needsSetup && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 w-fit text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">Cartão de Crédito</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Cobrança automática todo mês. Você autoriza uma vez no checkout do Mercado Pago.
              </p>
            </div>
            <Button
              className="mt-auto"
              disabled={cardMutation.isPending}
              onClick={() => cardMutation.mutate()}
            >
              {cardMutation.isPending ? 'Redirecionando...' : 'Assinar com cartão'}
            </Button>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 w-fit text-blue-600">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">Pix</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Uma nova cobrança Pix é gerada a cada ciclo — você paga o QR code todo mês.
              </p>
            </div>
            <Button
              variant="secondary"
              className="mt-auto"
              disabled={pixMutation.isPending}
              onClick={() => pixMutation.mutate()}
            >
              {pixMutation.isPending ? 'Gerando...' : 'Gerar cobrança Pix'}
            </Button>
          </div>
        </div>
      )}

      {/* Histórico de pagamentos */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Histórico de Pagamentos</h2>
        {paymentsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (payments?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-12 text-center text-sm text-zinc-400">
            Nenhuma cobrança gerada ainda.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Vencimento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Forma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {payments!.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(p.dueDate)}</td>
                      <td className="px-4 py-3 text-zinc-700">{METHOD_LABELS[p.method]}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_CONFIG[p.status].color}`}
                        >
                          {PAYMENT_STATUS_CONFIG[p.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-800">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Pix */}
      <Modal open={pixModalVisible} onClose={() => setPixModalOpen(false)} title="Pagar com Pix">
        {pendingPixPayment ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              Escaneie o QR code ou copie o código abaixo no app do seu banco. Assim que o pagamento for
              confirmado, esta tela atualiza sozinha.
            </p>
            {pendingPixPayment.pixQrCode && (
              <img
                src={`data:image/png;base64,${pendingPixPayment.pixQrCode}`}
                alt="QR code Pix"
                className="mx-auto h-56 w-56 rounded-xl border border-zinc-200"
              />
            )}
            {pendingPixPayment.pixCopyPaste && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={pendingPixPayment.pixCopyPaste}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 truncate"
                />
                <Button variant="secondary" size="sm" onClick={copyPixCode}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock className="h-3.5 w-3.5" />
              Aguardando confirmação do pagamento...
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
      </Modal>
    </div>
  )
}
