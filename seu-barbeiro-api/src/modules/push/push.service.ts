import webpush from 'web-push'
import { prisma } from '../../lib/prisma'

let configured: boolean | undefined
function ready() {
  if (configured !== undefined) return configured
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env
  configured = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
  if (!configured) return false
  // O assunto precisa ser https: ou mailto:; em ambiente local cai no padrão.
  const subject = [process.env.VAPID_SUBJECT, process.env.PUBLIC_WEB_URL].find(
    (value) => value && /^(https:|mailto:)/.test(value),
  )
  try {
    webpush.setVapidDetails(
      subject || 'https://seubarbeiro.impulsiodigital.com',
      VAPID_PUBLIC_KEY!,
      VAPID_PRIVATE_KEY!,
    )
  } catch (error) {
    console.error('Chaves de notificação push inválidas; avisos desligados.', error)
    configured = false
  }
  return configured
}

export function pushPublicKey() {
  return ready() ? process.env.VAPID_PUBLIC_KEY! : null
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string }

/**
 * Avisa a equipe no celular. Dono e recepção recebem tudo; o profissional
 * recebe só o que é da agenda dele. Nunca lança erro: aviso é complementar.
 */
export async function notifyStaff(payload: PushPayload, barberId?: string) {
  try {
    if (!ready()) return
    const admins = await prisma.admin.findMany({
      where: {
        isActive: true,
        OR: [
          { role: { in: ['OWNER', 'RECEPTION'] } },
          ...(barberId ? [{ role: 'PROFESSIONAL', barberId }] : []),
        ],
      },
      select: { id: true },
    })
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { adminId: { in: admins.map((a) => a.id) } },
    })
    await Promise.all(
      subscriptions.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(payload),
            { TTL: 3600 },
          )
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode
          // Assinatura revogada pelo navegador: remove para não tentar de novo.
          if (status === 404 || status === 410)
            await prisma.pushSubscription.deleteMany({ where: { id: s.id } })
        }
      }),
    )
  } catch (error) {
    console.error('Falha ao enviar notificação push', error)
  }
}
