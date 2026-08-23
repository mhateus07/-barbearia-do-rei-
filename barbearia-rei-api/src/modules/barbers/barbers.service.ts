import { prisma } from '../../lib/prisma'
import { getTenantId } from '../../lib/tenant-context'
import { AppError } from '../../lib/errors'
import { parseDateParam } from '../../utils/date'
import { CreateBarberInput, UpdateBarberInput } from './barbers.schema'

export async function listBarbers(isActive?: boolean) {
  return prisma.barber.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function getBarberById(id: string) {
  const barber = await prisma.barber.findUnique({ where: { id } })
  if (!barber) throw new AppError('Barbeiro não encontrado', 404)
  return barber
}

export async function createBarber(input: CreateBarberInput) {
  return prisma.barber.create({ data: { ...input, tenantId: getTenantId() } })
}

export async function updateBarber(id: string, input: UpdateBarberInput) {
  await getBarberById(id)
  return prisma.barber.update({ where: { id }, data: input })
}

export async function deactivateBarber(id: string) {
  await getBarberById(id)
  return prisma.barber.update({ where: { id }, data: { isActive: false } })
}

export async function getBarberAppointments(id: string, from?: string, to?: string) {
  await getBarberById(id)
  return prisma.appointment.findMany({
    where: {
      barberId: id,
      startsAt: {
        gte: from ? parseDateParam(from, 'from') : undefined,
        lte: to ? parseDateParam(to, 'to') : undefined,
      },
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      services: { include: { service: { select: { id: true, name: true } } } },
    },
    orderBy: { startsAt: 'asc' },
  })
}
