import { prisma } from '../../lib/prisma'
import { comparePassword } from '../../utils/bcrypt'
import { signToken } from '../../config/jwt'
import { LoginInput } from './auth.schema'

export async function loginService(input: LoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } })

  if (!admin) {
    throw new Error('Credenciais inválidas')
  }

  const isValid = await comparePassword(input.password, admin.passwordHash)
  if (!isValid) {
    throw new Error('Credenciais inválidas')
  }

  const token = signToken({ sub: admin.id, email: admin.email })

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  }
}

export async function getMeService(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!admin) throw new Error('Admin não encontrado')
  return admin
}
