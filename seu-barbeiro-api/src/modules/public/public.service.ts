import {
  assertAvailability,
  runSchedule,
  bookInTransaction,
  parseHours,
} from '../appointments/scheduling'
import { normalizePhone } from '../../utils/phone'
import { prisma } from '../../lib/prisma'
import { getSettings } from '../settings/settings.service'

export async function getPublicInfo() {
  const settings = await getSettings()
  return {
    shopLogo: settings.shop_logo,
    shopDescription: settings.shop_description,
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
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      durationMin: true,
      processingMin: true,
      finishingMin: true,
    },
  })
}

export async function getPublicBarbers() {
  return prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      serviceIds: true,
      serviceOverrides: true,
    },
  })
}

export async function getAvailableSlots(
  barberId: string,
  date: string,
  totalDuration: number,
  serviceIds?: string[],
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(totalDuration) ||
    totalDuration <= 0 ||
    totalDuration > 1440
  )
    throw new Error('Data ou duração inválida')
  const settings = await getSettings()
  const day = new Date(`${date}T12:00:00`)
  const names = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const hours = parseHours(settings[`hours_${names[day.getDay()]}`])
  if (!hours) return []
  const barbers = await prisma.barber.findMany({
    where: { isActive: true, ...(barberId === 'any' ? {} : { id: barberId }) },
  })
  const slots: string[] = []
  for (
    let minute = hours.open;
    minute + totalDuration <= hours.close;
    minute += 15
  ) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
    const start = new Date(`${date}T${time}:00`)
    if (start <= new Date()) continue
    for (const barber of barbers) {
      if (!serviceIds?.length)
        throw new Error('Informe os serviços para consultar disponibilidade')
      try {
        await assertAvailability(prisma, barber.id, serviceIds, start)
        slots.push(time)
        break
      } catch (error) {
        if (
          !(error instanceof Error) ||
          ![
            'horário',
            'expediente',
            'Profissional',
            'Recurso',
            'Serviço',
            'reservado',
          ].some((word) => error.message.includes(word))
        )
          throw error
      }
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
  outreachToken?: string
}) {
  return runSchedule(async (tx) => {
    const phone = normalizePhone(data.clientPhone)
    const matches = await tx.$queryRaw<
      { id: string }[]
    >`SELECT id FROM clients WHERE regexp_replace(phone, '[^0-9]', '', 'g') IN (${phone}, ${phone.slice(2)})`
    if (matches.length > 1)
      throw new Error(
        'Entre em contato com o salão para atualizar seu cadastro',
      )
    let client = matches[0]
      ? await tx.client.findUnique({ where: { id: matches[0].id } })
      : null
    if (!client)
      client = await tx.client.create({
        data: {
          name: data.clientName,
          phone,
          email: data.clientEmail || undefined,
        },
      })
    let barberId = data.barberId
    const startsAt = new Date(`${data.date}T${data.time}:00`)
    if (barberId === 'any') {
      const barbers = await tx.barber.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      })
      barberId = ''
      for (const barber of barbers) {
        try {
          await assertAvailability(tx, barber.id, data.serviceIds, startsAt)
          barberId = barber.id
          break
        } catch (error) {
          if (!(error instanceof Error) || error.message.includes('prisma'))
            throw error
        }
      }
      if (!barberId)
        throw new Error('Nenhum profissional disponível neste horário')
    }
    const outreach = data.outreachToken
      ? await tx.outreach.findFirst({
          where: {
            token: data.outreachToken,
            clientId: client.id,
            appointmentId: null,
            createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
          },
        })
      : null
    const appointment = await bookInTransaction(tx, {
      clientId: client.id,
      barberId,
      serviceIds: data.serviceIds,
      startsAt: startsAt.toISOString(),
      notes: data.notes,
      source: outreach ? 'REACTIVATION' : 'ONLINE',
    })
    if (outreach)
      await tx.outreach.update({
        where: { id: outreach.id },
        data: { appointmentId: appointment.id },
      })
    // Public responses never expose details from an existing client record.
    return {
      id: appointment.id,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      totalPrice: appointment.totalPrice,
      barber: appointment.barber,
      services: appointment.services,
      client: { name: data.clientName },
    }
  })
}
