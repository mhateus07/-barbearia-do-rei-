import { NotificationType, NotificationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { getSetting } from '../settings/settings.service'

// ─── ENVIO WHATSAPP ───────────────────────────────────────────────────────────

async function sendWhatsAppMessage(phone: string, message: string): Promise<{ ok: boolean; error?: string }> {
  const enabled = await getSetting('whatsapp_enabled')
  if (enabled !== 'true') return { ok: false, error: 'WhatsApp desativado nas configurações' }

  const apiUrl = await getSetting('whatsapp_api_url')
  const apiKey = await getSetting('whatsapp_api_key')
  const instance = await getSetting('whatsapp_instance')

  if (!apiUrl || !apiKey || !instance) {
    return { ok: false, error: 'WhatsApp não configurado (URL, chave ou instância ausente)' }
  }

  // Normaliza número: remove não-dígitos, adiciona 55 se necessário
  const cleanPhone = phone.replace(/\D/g, '')
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        number: fullPhone,
        text: message,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return { ok: false, error: `API retornou ${response.status}: ${body}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// ─── LOG + ENVIO ──────────────────────────────────────────────────────────────

export async function sendAndLog(params: {
  type: NotificationType
  phone: string
  message: string
  clientId?: string
  appointmentId?: string
}) {
  const log = await prisma.notificationLog.create({
    data: {
      type: params.type,
      phone: params.phone,
      message: params.message,
      clientId: params.clientId,
      appointmentId: params.appointmentId,
      status: NotificationStatus.PENDING,
    },
  })

  const result = await sendWhatsAppMessage(params.phone, params.message)

  const updated = await prisma.notificationLog.update({
    where: { id: log.id },
    data: {
      status: result.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
      error: result.error,
      sentAt: result.ok ? new Date() : null,
    },
  })

  return { log: updated, sent: result.ok, error: result.error }
}

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

export function buildConfirmationMessage(clientName: string, barberName: string, startsAt: Date, services: string[]): string {
  const date = startsAt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
  const time = startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `✅ *Agendamento confirmado!*\n\nOlá, ${clientName}! Seu agendamento está confirmado.\n\n📅 *Data:* ${date}\n⏰ *Horário:* ${time}\n✂️ *Serviços:* ${services.join(', ')}\n💈 *Barbeiro:* ${barberName}\n\n_Barbearia do Rei - São João del Rei_`
}

export function buildReminderMessage(clientName: string, barberName: string, startsAt: Date, services: string[]): string {
  const time = startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `⏰ *Lembrete de agendamento!*\n\nOlá, ${clientName}! Amanhã às ${time} você tem um horário marcado.\n\n✂️ *Serviços:* ${services.join(', ')}\n💈 *Barbeiro:* ${barberName}\n\nTe esperamos! 💈\n\n_Barbearia do Rei - São João del Rei_`
}

export function buildCancellationMessage(clientName: string, startsAt: Date): string {
  const date = startsAt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
  const time = startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `❌ *Agendamento cancelado*\n\nOlá, ${clientName}. Seu agendamento de ${date} às ${time} foi cancelado.\n\nPara remarcar, entre em contato conosco.\n\n_Barbearia do Rei - São João del Rei_`
}

// ─── LEMBRETES AUTOMÁTICOS ───────────────────────────────────────────────────

export async function sendPendingReminders(): Promise<{ sent: number; failed: number }> {
  const hoursAhead = Number(await getSetting('whatsapp_reminder_hours')) || 24

  const now = new Date()
  const targetFrom = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000)
  const targetTo = new Date(now.getTime() + (hoursAhead + 1) * 60 * 60 * 1000)

  // Busca agendamentos que ainda não receberam lembrete
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startsAt: { gte: targetFrom, lte: targetTo },
      notificationLogs: {
        none: { type: 'APPOINTMENT_REMINDER' },
      },
    },
    include: {
      client: true,
      barber: true,
      services: { include: { service: true } },
    },
  })

  let sent = 0
  let failed = 0

  for (const appt of appointments) {
    const services = appt.services.map((s) => s.service.name)
    const message = buildReminderMessage(appt.client.name, appt.barber.name, appt.startsAt, services)
    const result = await sendAndLog({
      type: 'APPOINTMENT_REMINDER',
      phone: appt.client.phone,
      message,
      clientId: appt.client.id,
      appointmentId: appt.id,
    })
    result.sent ? sent++ : failed++
  }

  return { sent, failed }
}

// ─── LISTAGEM ─────────────────────────────────────────────────────────────────

export async function listNotificationLogs(filters: {
  status?: NotificationStatus
  type?: NotificationType
  page?: number
  limit?: number
}) {
  const { status, type, page = 1, limit = 50 } = filters
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.type = type

  const [data, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        appointment: { select: { id: true, startsAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationLog.count({ where }),
  ])

  return { data, total, page, limit }
}
