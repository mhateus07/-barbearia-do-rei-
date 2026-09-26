import { prisma, currentSalon } from '../../lib/prisma'
import { comparePassword } from '../../utils/bcrypt'
import { signToken } from '../../config/jwt'
import { LoginInput } from './auth.schema'

export async function loginService(input: LoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } })

  if (!admin || !admin.isActive) {
    throw new Error('Credenciais inválidas')
  }

  const isValid = await comparePassword(input.password, admin.passwordHash)
  if (!isValid) {
    throw new Error('Credenciais inválidas')
  }

  const token = signToken({
    sub: admin.id,
    email: admin.email,
    salon: currentSalon().slug,
  })

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      barberId: admin.barberId,
      salon: currentSalon().slug,
    },
  }
}

export async function getMeService(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      barberId: true,
      createdAt: true,
    },
  })
  if (!admin) throw new Error('Admin não encontrado')
  return admin
}
