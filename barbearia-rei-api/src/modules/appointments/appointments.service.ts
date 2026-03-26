import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  UpdateStatusInput,
} from './appointments.schema'

const appointmentInclude = {
  client: { select: { id: true, name: true, phone: true } },
  barber: { select: { id: true, name: true } },
  services: {
    include: {
      service: { select: { id: true, name: true } },
    },
  },
}

export async function listAppointments(filters: {
  date?: string
  from?: string
  to?: string
  barberId?: string
  clientId?: string
  status?: AppointmentStatus
  page?: number
  limit?: number
}) {
  const { date, from, to, barberId, clientId, status, page = 1, limit = 50 } = filters

  const where: Record<string, unknown> = {}

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.startsAt = { gte: start, lte: end }
  } else if (from || to) {
    where.startsAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  if (barberId) where.barberId = barberId
  if (clientId) where.clientId = clientId
  if (status) where.status = status

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startsAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ])

  return { data, total, page, limit }
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  })
  if (!appointment) throw new Error('Agendamento não encontrado')
  return appointment
}

export async function createAppointment(input: CreateAppointmentInput) {
  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, isActive: true },
  })

  if (services.length !== input.serviceIds.length) {
    throw new Error('Um ou mais serviços não encontrados ou inativos')
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)

  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)

  // Verificar conflito de horário do barbeiro
  const conflict = await prisma.appointment.findFirst({
    where: {
      barberId: input.barberId,
      status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      OR: [
        { startsAt: { gte: startsAt, lt: endsAt } },
        { endsAt: { gt: startsAt, lte: endsAt } },
        { startsAt: { lte: startsAt }, endsAt: { gte: endsAt } },
      ],
    },
  })

  if (conflict) {
    throw new Error('Barbeiro já possui agendamento neste horário')
  }

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        clientId: input.clientId,
        barberId: input.barberId,
        startsAt,
        endsAt,
        totalPrice,
        notes: input.notes,
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            priceSnapshot: Number(s.price),
            durationSnapshot: s.durationMin,
          })),
        },
      },
      include: appointmentInclude,
    })
    return appointment
  })
}

export async function updateAppointment(id: string, input: UpdateAppointmentInput) {
  const existing = await getAppointmentById(id)

  const serviceIds = input.serviceIds ?? existing.services.map((s) => s.service.id)
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  })

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)

  const startsAt = input.startsAt ? new Date(input.startsAt) : existing.startsAt
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)

  return prisma.$transaction(async (tx) => {
    if (input.serviceIds) {
      await tx.appointmentService.deleteMany({ where: { appointmentId: id } })
      await tx.appointmentService.createMany({
        data: services.map((s) => ({
          appointmentId: id,
          serviceId: s.id,
          priceSnapshot: Number(s.price),
          durationSnapshot: s.durationMin,
        })),
      })
    }

    return tx.appointment.update({
      where: { id },
      data: {
        clientId: input.clientId,
        barberId: input.barberId,
        startsAt,
        endsAt,
        totalPrice,
        notes: input.notes,
      },
      include: appointmentInclude,
    })
  })
}

export async function updateAppointmentStatus(id: string, input: UpdateStatusInput) {
  await getAppointmentById(id)
  return prisma.appointment.update({
    where: { id },
    data: { status: input.status },
    include: appointmentInclude,
  })
}

export async function deleteAppointment(id: string) {
  const appointment = await getAppointmentById(id)
  const allowed = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
  if (!allowed.includes(appointment.status)) {
    throw new Error('Apenas agendamentos com status SCHEDULED ou CONFIRMED podem ser excluídos')
  }
  return prisma.appointment.delete({ where: { id } })
}
