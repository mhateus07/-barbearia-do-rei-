import crypto from 'node:crypto'
import { env } from '../config/env'
import { AppError } from './errors'

const MP_BASE_URL = 'https://api.mercadopago.com'

function requireAccessToken(): string {
  if (!env.MP_ACCESS_TOKEN) {
    throw new AppError('Cobrança não configurada: MP_ACCESS_TOKEN ausente.', 500)
  }
  return env.MP_ACCESS_TOKEN
}

async function mpFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = requireAccessToken()

  let response: Response
  try {
    response = await fetch(`${MP_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
  } catch (err) {
    console.error('[mercadopago] falha de rede:', err)
    throw new AppError('Não foi possível conectar ao Mercado Pago. Tente novamente.', 502)
  }

  if (!response.ok) {
    const body = await response.text()
    console.error(`[mercadopago] ${options.method ?? 'GET'} ${path} retornou ${response.status}: ${body}`)
    throw new AppError('O Mercado Pago recusou a operação. Tente novamente em instantes.', 502)
  }

  return response.json() as Promise<T>
}

// ─── ASSINATURA DE CARTÃO (PREAPPROVAL) ────────────────────────────────────────

interface CreateCardPreapprovalInput {
  payerEmail: string
  amount: number
  reason: string
  externalReference: string
}

interface MpPreapproval {
  id: string
  init_point: string
  status: string
}

// Cria uma assinatura "sem plano associado" (sem card_token_id) — o Mercado
// Pago devolve um init_point (checkout hospedado) onde o admin cadastra o
// cartão; a partir da autorização lá, o MP cobra automaticamente todo ciclo.
// https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview
export async function createCardPreapproval(input: CreateCardPreapprovalInput): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      back_url: env.MP_BILLING_RETURN_URL,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: input.amount,
        currency_id: 'BRL',
      },
    }),
  })
}

export async function getPreapproval(id: string): Promise<MpPreapproval & { status: string }> {
  return mpFetch(`/preapproval/${id}`)
}

export async function cancelPreapproval(id: string): Promise<void> {
  await mpFetch(`/preapproval/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

// ─── COBRANÇA PIX AVULSA (RENOVADA A CADA CICLO PELO JOB) ──────────────────────

interface CreatePixPaymentInput {
  payerEmail: string
  amount: number
  description: string
  externalReference: string
}

interface MpPixPayment {
  id: number
  status: string
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
}

export async function createPixPayment(input: CreatePixPaymentInput): Promise<MpPixPayment> {
  return mpFetch<MpPixPayment>('/v1/payments', {
    method: 'POST',
    // MP exige idempotência em criação de pagamento.
    headers: { 'X-Idempotency-Key': input.externalReference },
    body: JSON.stringify({
      transaction_amount: input.amount,
      description: input.description,
      payment_method_id: 'pix',
      external_reference: input.externalReference,
      payer: { email: input.payerEmail },
    }),
  })
}

export async function getPayment(id: string): Promise<MpPixPayment & { external_reference?: string }> {
  return mpFetch(`/v1/payments/${id}`)
}

// ─── VALIDAÇÃO DE ASSINATURA DO WEBHOOK ────────────────────────────────────────

/**
 * Recalcula o HMAC-SHA256 do webhook do Mercado Pago e compara com o `v1`
 * enviado no header `x-signature`, pra garantir que a notificação realmente
 * veio do MP (nunca confiar no corpo/headers sem essa checagem). Extraída
 * como função pura pra ser testável sem precisar de uma request HTTP real.
 * Algoritmo documentado em:
 * https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 * (conferir contra a doc atual — é a peça mais sensível a mudar).
 */
export function verifyWebhookSignature(params: {
  xSignature: string | undefined
  xRequestId: string | undefined
  dataId: string | undefined
  secret: string | undefined
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params
  if (!xSignature || !xRequestId || !dataId || !secret) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=')
      return [k?.trim(), v?.trim()]
    }),
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    // v1 mal formado (tamanho diferente etc.) — trata como assinatura inválida.
    return false
  }
}
