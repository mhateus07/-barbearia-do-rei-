import { prisma } from '../../lib/prisma'
import { runWithTenant } from '../../lib/tenant-context'
import { comparePassword } from '../../utils/bcrypt'
import { signToken } from '../../config/jwt'
import { AppError } from '../../lib/errors'
import { LoginInput } from './auth.schema'

export async function loginService(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: input.slug } })
  if (!tenant) {
    throw new AppError('Credenciais inválidas', 401)
  }
  if (tenant.status === 'SUSPENDED') {
    throw new AppError('Conta suspensa. Entre em contato com o suporte.', 403)
  }

  return runWithTenant(tenant.id, async () => {
    const admin = await prisma.admin.findFirst({ where: { email: input.email } })

    if (!admin) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const isValid = await comparePassword(input.password, admin.passwordHash)
    if (!isValid) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const token = signToken({
      sub: admin.id,
      email: admin.email,
      tenantId: admin.tenantId,
      tenantSlug: tenant.slug,
    })

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
    }
  })
}

export async function getMeService(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!admin) throw new AppError('Admin não encontrado', 404)
  return admin
}
