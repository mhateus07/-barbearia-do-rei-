import {
  runSchedule,
  bookInTransaction,
  assertAvailability,
} from './scheduling'
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
  const {
    date,
    from,
    to,
    barberId,
    clientId,
    status,
    page = 1,
    limit = 50,
  } = filters

  const where: Record<string, unknown> = {}

  if (date) {
    const start = new Date(`${date}T00:00:00`)
    start.setHours(0, 0, 0, 0)
    const end = new Date(`${date}T00:00:00`)
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
  return runSchedule((tx) => bookInTransaction(tx, input))
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
) {
  return runSchedule(async (tx) => {
    const existing = await tx.appointment.findUnique({
      where: { id },
      include: { services: true, payments: true },
    })
    if (!existing) throw new Error('Agendamento não encontrado')
    if (!['SCHEDULED', 'CONFIRMED'].includes(existing.status))
      throw new Error('Somente agendamentos pendentes podem ser editados')
    const servicesChanged = !!input.serviceIds
    const serviceIds =
      input.serviceIds ?? existing.services.map((s) => s.serviceId)
    const startsAt = input.startsAt
      ? new Date(input.startsAt)
      : existing.startsAt
    const barberId = input.barberId ?? existing.barberId
    const planned = await assertAvailability(
      tx,
      barberId,
      serviceIds,
      startsAt,
      id,
      undefined,
      false,
      servicesChanged ? undefined : existing.services,
    )
    if (
      input.clientId &&
      !(await tx.client.findUnique({ where: { id: input.clientId } }))
    )
      throw new Error('Cliente não encontrado')
    const totalPrice = servicesChanged
      ? planned.services.reduce((sum, s) => sum + Number(s.price), 0)
      : Number(existing.totalPrice)
    if (servicesChanged && existing.payments.some((p) => !p.refundedAt))
      throw new Error('Estorne os recebimentos antes de alterar os serviços')
    await tx.appointmentSegment.deleteMany({ where: { appointmentId: id } })
    if (servicesChanged)
      await tx.appointmentService.deleteMany({ where: { appointmentId: id } })
    return tx.appointment.update({
      where: { id },
      data: {
        clientId: input.clientId,
        barberId,
        startsAt,
        endsAt: planned.endsAt,
        totalPrice,
        notes: input.notes,
        ...(input.barberId
          ? { commissionRateSnapshot: planned.barber.commissionRate ?? 0 }
          : {}),
        segments: { create: planned.segments },
        ...(servicesChanged
          ? {
              services: {
                create: planned.services.map((s) => ({
                  serviceId: s.id,
                  priceSnapshot: s.price,
                  durationSnapshot:
                    s.durationMin + s.processingMin + s.finishingMin,
                  processingSnapshot: s.processingMin,
                  finishingSnapshot: s.finishingMin,
                  resourceSnapshot: s.resourceId,
                })),
              },
            }
          : {}),
      },
      include: appointmentInclude,
    })
  })
}

export async function updateAppointmentStatus(
  id: string,
  input: UpdateStatusInput,
) {
  return runSchedule(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id } })
    if (!appointment) throw new Error('Agendamento não encontrado')
    if (appointment.status === input.status)
      return tx.appointment.findUnique({
        where: { id },
        include: appointmentInclude,
      })
    const transitions: Record<string, string[]> = {
      SCHEDULED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    }
    if (!transitions[appointment.status].includes(input.status))
      throw new Error('Transição de status inválida')
    let credited = appointment.loyaltyCredited
    if (input.status === 'COMPLETED' && !credited) {
      const enabled = await tx.settings.findUnique({
        where: { key: 'loyalty_enabled' },
      })
      const pointsRow = await tx.settings.findUnique({
        where: { key: 'loyalty_points_per_visit' },
      })
      const points = Number(pointsRow?.value ?? 10)
      if (enabled?.value !== 'false') {
        if (!Number.isInteger(points) || points < 0)
          throw new Error('Configuração de pontos inválida')
        await tx.loyaltyCard.upsert({
          where: { clientId: appointment.clientId },
          create: {
            clientId: appointment.clientId,
            visitCount: 1,
            pointsBalance: points,
            pointsEarned: points,
          },
          update: {
            visitCount: { increment: 1 },
            pointsBalance: { increment: points },
            pointsEarned: { increment: points },
          },
        })
      }
      credited = true
    }
    return tx.appointment.update({
      where: { id },
      data: { status: input.status, loyaltyCredited: credited },
      include: appointmentInclude,
    })
  })
}

export async function deleteAppointment(id: string) {
  const appointment = await getAppointmentById(id)
  const allowed: AppointmentStatus[] = [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
  ]
  if (!allowed.includes(appointment.status)) {
    throw new Error(
      'Apenas agendamentos com status SCHEDULED ou CONFIRMED podem ser excluídos',
    )
  }
  return prisma.appointment.delete({ where: { id } })
}
