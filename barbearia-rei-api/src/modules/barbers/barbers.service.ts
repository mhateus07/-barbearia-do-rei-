import { prisma } from '../../lib/prisma'
import { CreateBarberInput, UpdateBarberInput } from './barbers.schema'

export async function listBarbers(isActive?: boolean) {
  return prisma.barber.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function getBarberById(id: string) {
  const barber = await prisma.barber.findUnique({ where: { id } })
  if (!barber) throw new Error('Barbeiro não encontrado')
  return barber
}

export async function createBarber(input: CreateBarberInput) {
  return prisma.barber.create({ data: input })
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
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      services: { include: { service: { select: { id: true, name: true } } } },
    },
    orderBy: { startsAt: 'asc' },
  })
}
