import { WaitlistStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { getTenantId } from '../../lib/tenant-context'
import { AppError } from '../../lib/errors'
import { env } from '../../config/env'
import { getSetting } from '../settings/settings.service'
import { sendAndLog } from '../notifications/notifications.service'
import { CreateWaitlistEntryInput } from './waitlist.schema'

const waitlistInclude = {
  client: { select: { id: true, name: true, phone: true } },
  barber: { select: { id: true, name: true } },
  service: { select: { id: true, name: true } },
}

export async function listWaitlistEntries(filters: { status?: WaitlistStatus; page?: number; limit?: number }) {
  const { status, page = 1, limit = 50 } = filters
  const where = status ? { status } : {}

  const [data, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where,
      include: waitlistInclude,
      orderBy: { preferredDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.waitlistEntry.count({ where }),
  ])

  return { data, total, page, limit }
}

export async function createWaitlistEntry(input: CreateWaitlistEntryInput) {
  return prisma.waitlistEntry.create({
    data: {
      tenantId: getTenantId(),
      clientId: input.clientId,
      barberId: input.barberId,
      serviceId: input.serviceId,
      preferredDate: new Date(input.preferredDate),
      notes: input.notes,
    },
    include: waitlistInclude,
  })
}

export async function updateWaitlistStatus(id: string, status: WaitlistStatus) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } })
  if (!entry) throw new AppError('Entrada da lista de espera não encontrada', 404)
  return prisma.waitlistEntry.update({ where: { id }, data: { status }, include: waitlistInclude })
}

export async function deleteWaitlistEntry(id: string) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } })
  if (!entry) throw new AppError('Entrada da lista de espera não encontrada', 404)
  return prisma.waitlistEntry.delete({ where: { id } })
}

// `preferredDate` é guardada como meia-noite UTC da data escolhida (string
// "YYYY-MM-DD" sem hora é sempre interpretada como UTC pelo JS), enquanto
// `startsAt` do agendamento vem de um datetime-local sem timezone, então é
// interpretado no fuso local do processo — por isso os getters diferem:
// UTC de um lado, local do outro, pra recuperar o mesmo dia-calendário que
// cada valor representava na hora em que foi criado.
function sameDay(preferredDateUtc: Date, appointmentLocal: Date): boolean {
  return (
    preferredDateUtc.getUTCFullYear() === appointmentLocal.getFullYear() &&
    preferredDateUtc.getUTCMonth() === appointmentLocal.getMonth() &&
    preferredDateUtc.getUTCDate() === appointmentLocal.getDate()
  )
}

function buildWaitlistOpeningMessage(
  clientName: string,
  shopName: string,
  barberName: string | undefined,
  bookingUrl: string,
): string {
  const barberLine = barberName ? ` com ${barberName}` : ''
  return `🔔 *Abriu um horário!*\n\nOlá, ${clientName}! Um horário${barberLine} que combina com o que você pediu acabou de abrir.\n\nGaranta o seu:\n${bookingUrl}\n\n_${shopName}_`
}

/**
 * Chamado quando um agendamento é cancelado ou excluído — varre a lista de
 * espera por entradas esperando esse barbeiro (ou "qualquer barbeiro") nesse
 * dia e avisa por WhatsApp que abriu vaga.
 */
export async function notifyWaitlistForOpening(barberId: string, date: Date): Promise<{ notified: number }> {
  const candidates = await prisma.waitlistEntry.findMany({
    where: { status: WaitlistStatus.WAITING, OR: [{ barberId }, { barberId: null }] },
    include: waitlistInclude,
  })

  const matches = candidates.filter((entry) => sameDay(entry.preferredDate, date))
  if (matches.length === 0) return { notified: 0 }

  const [tenant, shopName] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: getTenantId() }, select: { slug: true } }),
    getSetting('shop_name'),
  ])
  const bookingUrl = `https://${env.BASE_DOMAIN}/${tenant.slug}/agendar`

  let notified = 0
  for (const entry of matches) {
    const message = buildWaitlistOpeningMessage(
      entry.client.name,
      shopName || 'sua barbearia',
      entry.barber?.name,
      bookingUrl,
    )
    const result = await sendAndLog({
      type: 'WAITLIST_SLOT_OPEN',
      phone: entry.client.phone,
      message,
      clientId: entry.clientId,
    })
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { status: WaitlistStatus.NOTIFIED, notifiedAt: new Date() },
    })
    if (result.sent) notified++
  }

  return { notified }
}
