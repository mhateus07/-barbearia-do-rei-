import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { getTenantId } from '../../lib/tenant-context'
import { getSettings } from '../settings/settings.service'
import { AppError } from '../../lib/errors'
import { parseDateParam } from '../../utils/date'

const NO_SLOT_MESSAGE = 'Horário não disponível. Por favor, escolha outro horário.'

export async function getPublicInfo() {
  const settings = await getSettings()

  let portfolioImages: string[] = []
  try {
    const parsed = JSON.parse(settings.portfolio_images || '[]')
    if (Array.isArray(parsed)) portfolioImages = parsed
  } catch {
    portfolioImages = []
  }

  return {
    shopName: settings.shop_name,
    shopPhone: settings.shop_phone,
    shopAddress: settings.shop_address,
    shopInstagram: settings.shop_instagram,
    logoUrl: settings.logo_url || null,
    portfolioImages,
    hours: {
      sunday: settings.hours_sunday,
      monday: settings.hours_monday,
      tuesday: settings.hours_tuesday,
      wednesday: settings.hours_wednesday,
      thursday: settings.hours_thursday,
      friday: settings.hours_friday,
      saturday: settings.hours_saturday,
    },
  }
}

export async function getPublicServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, price: true, durationMin: true },
  })
}

export async function getPublicBarbers() {
  return prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, avatarUrl: true },
  })
}

function parseHours(hoursStr: string): { open: number; close: number } | null {
  if (!hoursStr || hoursStr === 'closed') return null
  const [openStr, closeStr] = hoursStr.split('-')
  const [openH, openM] = openStr.split(':').map(Number)
  const [closeH, closeM] = closeStr.split(':').map(Number)
  return { open: openH * 60 + openM, close: closeH * 60 + closeM }
}

export async function getAvailableSlots(barberId: string, date: string, totalDuration: number) {
  const settings = await getSettings()

  const dateObj = parseDateParam(date, 'date')
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayKey = `hours_${dayNames[dateObj.getDay()]}`
  const hours = parseHours(settings[dayKey])

  if (!hours) return []

  const startOfDay = new Date(dateObj)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(dateObj)
  endOfDay.setHours(23, 59, 59, 999)

  const isAny = barberId === 'any'

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      ...(isAny ? {} : { barberId }),
      startsAt: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
    select: { startsAt: true, endsAt: true, barberId: true },
  })

  let barberIds: string[] = []
  if (isAny) {
    const activeBarbers = await prisma.barber.findMany({ where: { isActive: true }, select: { id: true } })
    barberIds = activeBarbers.map((b) => b.id)
  } else {
    barberIds = [barberId]
  }

  const now = new Date()
  const slots: string[] = []

  for (let min = hours.open; min + totalDuration <= hours.close; min += 30) {
    const slotH = Math.floor(min / 60)
    const slotM = min % 60
    const slotStr = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`
    const slotStart = new Date(`${date}T${slotStr}:00`)
    const slotEnd = new Date(slotStart.getTime() + totalDuration * 60 * 1000)

    if (slotStart <= now) continue

    if (isAny) {
      const available = barberIds.some((bid) => {
        const barberAppts = existingAppointments.filter((a) => a.barberId === bid)
        return !barberAppts.some((appt) => {
          const s = new Date(appt.startsAt)
          const e = new Date(appt.endsAt)
          return s < slotEnd && e > slotStart
        })
      })
      if (available) slots.push(slotStr)
    } else {
      const hasConflict = existingAppointments.some((appt) => {
        const s = new Date(appt.startsAt)
        const e = new Date(appt.endsAt)
        return s < slotEnd && e > slotStart
      })
      if (!hasConflict) slots.push(slotStr)
    }
  }

  return slots
}

export async function createPublicAppointment(data: {
  clientName: string
  clientPhone: string
  clientEmail?: string
  barberId: string
  serviceIds: string[]
  date: string
  time: string
  notes?: string
}) {
  const startsAt = parseDateParam(`${data.date}T${data.time}:00`, 'date/time')

  let client = await prisma.client.findFirst({ where: { phone: data.clientPhone } })

  if (!client) {
    client = await prisma.client.create({
      data: {
        tenantId: getTenantId(),
        name: data.clientName,
        phone: data.clientPhone,
        ...(data.clientEmail ? { email: data.clientEmail } : {}),
      },
    })
  }

  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds }, isActive: true },
  })

  if (services.length !== data.serviceIds.length) {
    throw new AppError('Um ou mais serviços não encontrados ou inativos', 400)
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)

  const requestedBarberId = data.barberId
  const tenantId = getTenantId()

  try {
    // A checagem de conflito e a criação do agendamento acontecem dentro da
    // mesma transação SERIALIZABLE — se dois clientes reservarem o mesmo
    // horário ao mesmo tempo pelo agendamento público, o Postgres aborta uma
    // das transações (erro P2034) em vez de deixar as duas passarem pela
    // checagem antes de qualquer uma confirmar.
    return await prisma.$transaction(
      async (tx) => {
        let barberId = requestedBarberId

        if (barberId === 'any') {
          const activeBarbers = await tx.barber.findMany({ where: { isActive: true }, select: { id: true } })
          let found: string | null = null
          for (const barber of activeBarbers) {
            const conflict = await tx.appointment.findFirst({
              where: {
                barberId: barber.id,
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                OR: [
                  { startsAt: { gte: startsAt, lt: endsAt } },
                  { endsAt: { gt: startsAt, lte: endsAt } },
                  { startsAt: { lte: startsAt }, endsAt: { gte: endsAt } },
                ],
              },
            })
            if (!conflict) {
              found = barber.id
              break
            }
          }
          if (!found) throw new AppError('Nenhum barbeiro disponível neste horário', 409)
          barberId = found
        } else {
          const conflict = await tx.appointment.findFirst({
            where: {
              barberId,
              status: { notIn: ['CANCELLED', 'NO_SHOW'] },
              OR: [
                { startsAt: { gte: startsAt, lt: endsAt } },
                { endsAt: { gt: startsAt, lte: endsAt } },
                { startsAt: { lte: startsAt }, endsAt: { gte: endsAt } },
              ],
            },
          })
          if (conflict) throw new AppError(NO_SLOT_MESSAGE, 409)
        }

        return tx.appointment.create({
          data: {
            tenantId,
            clientId: client!.id,
            barberId,
            startsAt,
            endsAt,
            totalPrice,
            notes: data.notes,
            services: {
              create: services.map((s) => ({
                serviceId: s.id,
                priceSnapshot: Number(s.price),
                durationSnapshot: s.durationMin,
              })),
            },
          },
          include: {
            client: { select: { id: true, name: true, phone: true } },
            barber: { select: { id: true, name: true } },
            services: {
              include: { service: { select: { id: true, name: true } } },
            },
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
      throw new AppError(NO_SLOT_MESSAGE, 409)
    }
    throw err
  }
}
