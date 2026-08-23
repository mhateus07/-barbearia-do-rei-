import { Request, Response } from 'express'
import { verifyWebhookSignature } from '../../lib/mercadopago'
import { env } from '../../config/env'
import { handleWebhook } from './billing.service'

/**
 * Recebe notificações do Mercado Pago. Sem authMiddleware/tenantMiddleware —
 * o tenant só é descoberto depois de resolver o recurso (ver billing.service).
 * Autenticado por assinatura HMAC (x-signature), não por JWT nem slug.
 */
export async function receiveMpWebhook(req: Request, res: Response) {
  const body = req.body as { type?: string; data?: { id?: string } } | undefined
  const topic = body?.type || (req.query.topic as string) || (req.query.type as string)
  const resourceId = body?.data?.id || (req.query['data.id'] as string) || (req.query.id as string)

  if (!topic || !resourceId) {
    // Notificação que não reconhecemos (ex.: teste manual do painel do MP) —
    // responde 200 pra não virar retry infinito de algo que não é nosso.
    return res.status(200).json({ ok: true })
  }

  const valid = verifyWebhookSignature({
    xSignature: req.headers['x-signature'] as string | undefined,
    xRequestId: req.headers['x-request-id'] as string | undefined,
    dataId: resourceId,
    secret: env.MP_WEBHOOK_SECRET,
  })
  if (!valid) {
    return res.status(401).json({ error: { message: 'Assinatura inválida' } })
  }

  try {
    await handleWebhook(topic, resourceId)
  } catch (err) {
    // Nunca deixa o MP re-tentar indefinidamente por um erro interno nosso —
    // loga pra investigação manual e responde 200 do mesmo jeito.
    console.error('[billing webhook] falha ao processar notificação:', err)
  }

  return res.status(200).json({ ok: true })
}
