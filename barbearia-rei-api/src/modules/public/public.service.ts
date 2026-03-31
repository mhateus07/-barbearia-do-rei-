import { prisma } from '../../lib/prisma'
import { getSettings } from '../settings/settings.service'

export async function getPublicInfo() {
  const settings = await getSettings()
  return {
    shopName: settings.shop_name,
    shopPhone: settings.shop_phone,
    shopAddress: settings.shop_address,
    shopInstagram: settings.shop_instagram,
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

  const dateObj = new Date(`${date}T00:00:00`)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayKey = `hours_${dayNames[dateObj.getDay()]}`
  const hours = parseHours(settings[dayKey])

  if (!hours) return []

  const startOfDay = new Date(`${date}T00:00:00`)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(`${date}T00:00:00`)
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
  let client = await prisma.client.findUnique({ where: { phone: data.clientPhone } })

  if (!client) {
    client = await prisma.client.create({
      data: {
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
    throw new Error('Um ou mais serviços não encontrados ou inativos')
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)

  const startsAt = new Date(`${data.date}T${data.time}:00`)
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)

  let barberId = data.barberId

  if (barberId === 'any') {
    const activeBarbers = await prisma.barber.findMany({ where: { isActive: true }, select: { id: true } })
    let found = false
    for (const barber of activeBarbers) {
      const conflict = await prisma.appointment.findFirst({
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
        barberId = barber.id
        found = true
        break
      }
    }
    if (!found) throw new Error('Nenhum barbeiro disponível neste horário')
  } else {
    const conflict = await prisma.appointment.findFirst({
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
    if (conflict) throw new Error('Horário não disponível. Por favor, escolha outro horário.')
  }

  return prisma.$transaction(async (tx) => {
    return tx.appointment.create({
      data: {
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
  })
}
