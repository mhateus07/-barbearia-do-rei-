import { prisma } from '../../lib/prisma'
import { CreateClientInput, UpdateClientInput } from './clients.schema'

export async function listClients(search?: string, page = 1, limit = 20) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.client.count({ where }),
  ])

  return { data, total, page, limit }
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) throw new Error('Cliente não encontrado')
  return client
}

export async function createClient(input: CreateClientInput) {
  return prisma.client.create({
    data: {
      ...input,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      email: input.email || undefined,
    },
  })
}

export async function updateClient(id: string, input: UpdateClientInput) {
  await getClientById(id)
  return prisma.client.update({
    where: { id },
    data: {
      ...input,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      email: input.email || undefined,
    },
  })
}

export async function deleteClient(id: string) {
  await getClientById(id)
  const hasAppointments = await prisma.appointment.count({ where: { clientId: id } })
  if (hasAppointments > 0) throw new Error('Cliente possui agendamentos e não pode ser excluído')
  return prisma.client.delete({ where: { id } })
}

export async function getClientAppointments(id: string) {
  await getClientById(id)
  return prisma.appointment.findMany({
    where: { clientId: id },
    include: {
      barber: { select: { id: true, name: true } },
      services: { include: { service: { select: { id: true, name: true } } } },
    },
    orderBy: { startsAt: 'desc' },
  })
}

export async function getClientLoyalty(clientId: string) {
  await getClientById(clientId)
  const card = await prisma.loyaltyCard.findUnique({ where: { clientId } })
  if (!card) {
    return { clientId, visitCount: 0, pointsBalance: 0, pointsEarned: 0, pointsRedeemed: 0 }
  }
  return card
}

export async function redeemLoyaltyPoints(clientId: string, points: number) {
  await getClientById(clientId)

  const card = await prisma.loyaltyCard.findUnique({ where: { clientId } })
  if (!card) throw new Error('Cliente ainda não tem cartão fidelidade')
  if (card.pointsBalance < points) throw new Error(`Pontos insuficientes. Saldo: ${card.pointsBalance}`)

  return prisma.loyaltyCard.update({
    where: { clientId },
    data: {
      pointsBalance: { decrement: points },
      pointsRedeemed: { increment: points },
    },
  })
}

export async function listClientsWithLoyalty(search?: string, page = 1, limit = 20) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: { loyaltyCard: true },
    }),
    prisma.client.count({ where }),
  ])

  return { data, total, page, limit }
}
