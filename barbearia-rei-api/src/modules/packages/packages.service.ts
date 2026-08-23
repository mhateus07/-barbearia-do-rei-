import { prisma } from '../../lib/prisma'
import { getTenantId } from '../../lib/tenant-context'
import { AppError } from '../../lib/errors'
import { CreatePackageInput, UpdatePackageInput, SellPackageInput } from './packages.schema'

export async function listPackages(isActive?: boolean) {
  return prisma.package.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    include: { service: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function getPackageById(id: string) {
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { service: { select: { id: true, name: true } } },
  })
  if (!pkg) throw new AppError('Pacote não encontrado', 404)
  return pkg
}

export async function createPackage(input: CreatePackageInput) {
  return prisma.package.create({
    data: { ...input, tenantId: getTenantId() },
    include: { service: { select: { id: true, name: true } } },
  })
}

export async function updatePackage(id: string, input: UpdatePackageInput) {
  await getPackageById(id)
  return prisma.package.update({
    where: { id },
    data: input,
    include: { service: { select: { id: true, name: true } } },
  })
}

export async function deactivatePackage(id: string) {
  await getPackageById(id)
  return prisma.package.update({ where: { id }, data: { isActive: false } })
}

const clientPackageInclude = {
  package: {
    select: { id: true, name: true, serviceId: true, service: { select: { id: true, name: true } } },
  },
}

export async function listClientPackages(clientId: string) {
  const rows = await prisma.clientPackage.findMany({
    where: { clientId },
    include: clientPackageInclude,
    orderBy: { purchasedAt: 'desc' },
  })
  const now = new Date()
  return rows.map((cp) => ({
    ...cp,
    sessionsRemaining: cp.sessionsTotal - cp.sessionsUsed,
    active: cp.sessionsUsed < cp.sessionsTotal && (!cp.expiresAt || cp.expiresAt >= now),
  }))
}

export async function sellPackageToClient(input: SellPackageInput) {
  const pkg = await getPackageById(input.packageId)
  if (!pkg.isActive) throw new AppError('Este pacote está desativado', 400)

  const tenantId = getTenantId()
  const expiresAt = pkg.validityDays
    ? new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000)
    : null

  return prisma.$transaction(async (tx) => {
    const clientPackage = await tx.clientPackage.create({
      data: {
        tenantId,
        clientId: input.clientId,
        packageId: input.packageId,
        sessionsTotal: pkg.totalSessions,
        pricePaid: pkg.price,
        expiresAt,
      },
      include: clientPackageInclude,
    })

    await tx.payment.create({
      data: {
        tenantId,
        amount: pkg.price,
        method: input.method,
        notes: input.notes,
        clientPackageId: clientPackage.id,
      },
    })

    return clientPackage
  })
}

/**
 * Valida que um ClientPackage pode ser usado pra pagar um agendamento de um
 * serviço específico — chamado pelo módulo de agendamentos antes de criar o
 * agendamento.
 */
export async function getUsableClientPackage(id: string, clientId: string, serviceId: string) {
  const cp = await prisma.clientPackage.findUnique({ where: { id }, include: clientPackageInclude })
  if (!cp || cp.clientId !== clientId) throw new AppError('Pacote do cliente não encontrado', 404)
  if (cp.package.serviceId !== serviceId) {
    throw new AppError('Este pacote não cobre o serviço selecionado', 400)
  }
  if (cp.sessionsUsed >= cp.sessionsTotal) throw new AppError('Pacote sem sessões restantes', 400)
  if (cp.expiresAt && cp.expiresAt < new Date()) throw new AppError('Pacote expirado', 400)
  return cp
}

export async function consumeSession(id: string) {
  return prisma.clientPackage.update({ where: { id }, data: { sessionsUsed: { increment: 1 } } })
}

export async function restoreSession(id: string) {
  const cp = await prisma.clientPackage.findUnique({ where: { id } })
  if (!cp || cp.sessionsUsed === 0) return
  return prisma.clientPackage.update({ where: { id }, data: { sessionsUsed: { decrement: 1 } } })
}
