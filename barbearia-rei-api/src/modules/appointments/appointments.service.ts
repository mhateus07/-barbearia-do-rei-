import { AppointmentStatus, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { getTenantId } from '../../lib/tenant-context'
import { AppError } from '../../lib/errors'
import { parseDateParam } from '../../utils/date'
import { CreateAppointmentInput, UpdateAppointmentInput, UpdateStatusInput } from './appointments.schema'

const SCHEDULING_CONFLICT_MESSAGE = 'Barbeiro já possui agendamento neste horário'

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
    const start = parseDateParam(date, 'date')
    start.setHours(0, 0, 0, 0)
    const end = parseDateParam(date, 'date')
    end.setHours(23, 59, 59, 999)
    where.startsAt = { gte: start, lte: end }
  } else if (from || to) {
    where.startsAt = {
      ...(from ? { gte: parseDateParam(from, 'from') } : {}),
      ...(to ? { lte: parseDateParam(to, 'to') } : {}),
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
  if (!appointment) throw new AppError('Agendamento não encontrado', 404)
  return appointment
}

export async function createAppointment(input: CreateAppointmentInput) {
  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, isActive: true },
  })

  if (services.length !== input.serviceIds.length) {
    throw new AppError('Um ou mais serviços não encontrados ou inativos', 400)
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0)
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)

  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)
  const tenantId = getTenantId()

  try {
    // Isolamento SERIALIZABLE: a checagem de conflito e a criação do
    // agendamento acontecem na mesma transação. Se dois clientes agendarem o
    // mesmo horário ao mesmo tempo, o Postgres detecta a anomalia de
    // serialização e aborta uma das transações (erro P2034), evitando dupla
    // marcação — o check-then-create isolado antes não protegia contra isso.
    return await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
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
          throw new AppError(SCHEDULING_CONFLICT_MESSAGE, 409)
        }

        return tx.appointment.create({
          data: {
            tenantId,
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
      throw new AppError(SCHEDULING_CONFLICT_MESSAGE, 409)
    }
    throw err
  }
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
  const appointment = await getAppointmentById(id)

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: input.status },
    include: appointmentInclude,
  })

  // Ao concluir, credita pontos de fidelidade ao cliente
  if (input.status === AppointmentStatus.COMPLETED) {
    try {
      const settingRow = await prisma.settings.findFirst({ where: { key: 'loyalty_enabled' } })
      const loyaltyEnabled = settingRow?.value ?? 'true'

      if (loyaltyEnabled === 'true') {
        const pointsRow = await prisma.settings.findFirst({ where: { key: 'loyalty_points_per_visit' } })
        const points = Number(pointsRow?.value ?? '10')

        await prisma.loyaltyCard.upsert({
          where: { clientId: appointment.clientId },
          create: {
            tenantId: getTenantId(),
            clientId: appointment.clientId,
            visitCount: 1,
            pointsBalance: points,
            pointsEarned: points,
            pointsRedeemed: 0,
          },
          update: {
            visitCount: { increment: 1 },
            pointsBalance: { increment: points },
            pointsEarned: { increment: points },
          },
        })
      }
    } catch {
      // Não falha o update de status se fidelidade der erro
    }
  }

  return updated
}

export async function deleteAppointment(id: string) {
  const appointment = await getAppointmentById(id)
  const allowed: AppointmentStatus[] = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
  if (!allowed.includes(appointment.status)) {
    throw new AppError('Apenas agendamentos com status SCHEDULED ou CONFIRMED podem ser excluídos', 400)
  }
  return prisma.appointment.delete({ where: { id } })
}
