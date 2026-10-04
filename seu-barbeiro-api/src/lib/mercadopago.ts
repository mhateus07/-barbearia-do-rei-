// Cliente mínimo da API de pagamentos do Mercado Pago (somente Pix).
// A URL pode ser trocada por MERCADOPAGO_API_URL (os testes usam um servidor falso).

const apiUrl = () =>
  (process.env.MERCADOPAGO_API_URL || 'https://api.mercadopago.com').replace(
    /\/$/,
    '',
  )

export type MpPayment = {
  id: number | string
  status: string
  transaction_amount: number
  external_reference?: string
  date_approved?: string | null
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}

async function call<T>(
  token: string,
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.idempotencyKey ? { 'X-Idempotency-Key': init.idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(15000),
  })
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string
  }
  if (!response.ok)
    throw new Error(
      `Mercado Pago recusou a operação (HTTP ${response.status})${body.message ? `: ${body.message}` : ''}`,
    )
  return body
}

/** Data no formato exigido pelo Mercado Pago, com o fuso do servidor. */
function mpDate(date: Date) {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const local = new Date(date.getTime() + offset * 60000)
  return `${local.toISOString().slice(0, 23)}${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

export function createPixPayment(
  token: string,
  input: {
    amount: number
    description: string
    externalReference: string
    expiresAt: Date
    payerEmail: string
    payerName: string
    notificationUrl?: string
    idempotencyKey: string
  },
) {
  const [firstName, ...rest] = input.payerName.trim().split(/\s+/)
  return call<MpPayment>(token, '/v1/payments', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: JSON.stringify({
      transaction_amount: Math.round(input.amount * 100) / 100,
      description: input.description.slice(0, 250),
      payment_method_id: 'pix',
      external_reference: input.externalReference,
      date_of_expiration: mpDate(input.expiresAt),
      ...(input.notificationUrl?.startsWith('https://')
        ? { notification_url: input.notificationUrl }
        : {}),
      payer: {
        email: input.payerEmail,
        first_name: firstName || 'Cliente',
        last_name: rest.join(' ') || undefined,
      },
    }),
  })
}

export function getPayment(token: string, id: string) {
  return call<MpPayment>(token, `/v1/payments/${encodeURIComponent(id)}`)
}

export function cancelPayment(token: string, id: string) {
  return call<MpPayment>(token, `/v1/payments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}
