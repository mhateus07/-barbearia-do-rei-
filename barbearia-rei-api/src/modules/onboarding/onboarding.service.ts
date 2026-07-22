import { prisma } from '../../lib/prisma'
import { runWithTenant } from '../../lib/tenant-context'
import { hashPassword } from '../../utils/bcrypt'
import { signToken } from '../../config/jwt'
import { SignupInput } from './onboarding.schema'

export async function signupTenant(input: SignupInput) {
  const existingSlug = await prisma.tenant.findUnique({ where: { slug: input.slug } })
  if (existingSlug) throw new Error('Esse endereço já está em uso. Escolha outro.')

  const tenant = await prisma.tenant.create({
    data: { slug: input.slug, name: input.shopName, status: 'TRIAL' },
  })

  return runWithTenant(tenant.id, async () => {
    const passwordHash = await hashPassword(input.adminPassword)
    const admin = await prisma.admin.create({
      data: { tenantId: tenant.id, name: input.adminName, email: input.adminEmail, passwordHash },
    })

    // shop_name explícito (senão o tenant ficaria com o default genérico
    // "Minha Barbearia" até o dono entrar em Configurações e salvar de novo).
    await prisma.settings.create({ data: { tenantId: tenant.id, key: 'shop_name', value: input.shopName } })

    // Um serviço inicial pra já dar pra testar o fluxo de agendamento.
    await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: 'Corte de Cabelo',
        price: 40,
        durationMin: 30,
        description: 'Serviço inicial — edite ou adicione mais em Serviços.',
      },
    })

    const token = signToken({ sub: admin.id, email: admin.email, tenantId: tenant.id, tenantSlug: tenant.slug })

    return {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    }
  })
}
