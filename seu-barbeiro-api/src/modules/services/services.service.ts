import { prisma } from '../../lib/prisma'
import { CreateServiceInput, UpdateServiceInput } from './services.schema'

export async function listServices(isActive?: boolean) {
  return prisma.service.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw new Error('Serviço não encontrado')
  return service
}

export async function createService(input: CreateServiceInput) {
  return prisma.service.create({ data: input })
}

export async function updateService(id: string, input: UpdateServiceInput) {
  await getServiceById(id)
  return prisma.service.update({ where: { id }, data: input })
}

export async function deactivateService(id: string) {
  await getServiceById(id)
  return prisma.service.update({ where: { id }, data: { isActive: false } })
}
