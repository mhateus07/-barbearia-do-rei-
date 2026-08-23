import 'dotenv/config'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'
import { runWithTenant } from '../src/lib/tenant-context'

const TENANT_SLUG = process.env.SEED_TENANT_SLUG || 'barbearia-do-rei'
const TENANT_NAME = process.env.SEED_TENANT_NAME || 'Barbearia do Rei'

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Administrador'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'

const BARBER_NAME = process.env.SEED_BARBER_NAME
const BARBER_PHONE = process.env.SEED_BARBER_PHONE
const BARBER_EMAIL = process.env.SEED_BARBER_EMAIL

const SHOP_NAME = process.env.SEED_SHOP_NAME || TENANT_NAME
const SHOP_PHONE = process.env.SEED_SHOP_PHONE || ''
const SHOP_ADDRESS = process.env.SEED_SHOP_ADDRESS || ''
const SHOP_INSTAGRAM = process.env.SEED_SHOP_INSTAGRAM || ''

function generatePassword() {
  return crypto.randomBytes(12).toString('base64url')
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    create: { slug: TENANT_SLUG, name: TENANT_NAME, status: 'ACTIVE' },
    update: {},
  })

  await runWithTenant(tenant.id, async () => {
    // Admin
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: ADMIN_EMAIL },
    })
    if (!existingAdmin) {
      const adminPassword = process.env.SEED_ADMIN_PASSWORD || generatePassword()
      const passwordHash = await bcrypt.hash(adminPassword, 10)
      await prisma.admin.create({
        data: { tenantId: tenant.id, name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash },
      })
      if (process.env.SEED_ADMIN_PASSWORD) {
        console.log(`Admin criado: ${ADMIN_EMAIL} (senha definida via SEED_ADMIN_PASSWORD)`)
      } else {
        console.log(`Admin criado: ${ADMIN_EMAIL} / ${adminPassword}`)
        console.log('Senha gerada automaticamente — troque-a no primeiro acesso e guarde-a em local seguro.')
      }
    }

    // Barbeiro inicial (opcional — só é criado se as variáveis de ambiente forem informadas)
    if (BARBER_NAME) {
      const existingBarber = await prisma.barber.findFirst({ where: { name: BARBER_NAME } })
      if (!existingBarber) {
        await prisma.barber.create({
          data: {
            tenantId: tenant.id,
            name: BARBER_NAME,
            phone: BARBER_PHONE || '',
            email: BARBER_EMAIL || '',
          },
        })
        console.log(`Barbeiro ${BARBER_NAME} criado.`)
      }
    }

    // Catálogo padrão de serviços
    const serviceCount = await prisma.service.count()
    if (serviceCount === 0) {
      await prisma.service.createMany({
        data: [
          {
            tenantId: tenant.id,
            name: 'Corte de Cabelo',
            price: 40.0,
            durationMin: 30,
            description: 'Corte clássico ou moderno',
          },
          {
            tenantId: tenant.id,
            name: 'Barba',
            price: 30.0,
            durationMin: 30,
            description: 'Modelagem e acabamento de barba',
          },
          {
            tenantId: tenant.id,
            name: 'Barba na Toalha Quente',
            price: 35.0,
            durationMin: 30,
            description: 'Barba com tratamento de toalha quente',
          },
          {
            tenantId: tenant.id,
            name: 'Cabelo + Sobrancelha',
            price: 45.0,
            durationMin: 30,
            description: 'Corte de cabelo com design de sobrancelha',
          },
          {
            tenantId: tenant.id,
            name: 'Cabelo + Barba + Sobrancelha',
            price: 80.0,
            durationMin: 60,
            description: 'Pacote completo com toalha quente',
          },
          {
            tenantId: tenant.id,
            name: 'Perfil (Pezinho)',
            price: 15.0,
            durationMin: 10,
            description: 'Acabamento do perfil',
          },
        ],
      })
      console.log('Serviços padrão criados.')
    } else {
      console.log(`${serviceCount} serviço(s) já cadastrado(s). Pulando.`)
    }

    // Identidade/branding da loja (settings) — preenchido via variáveis de ambiente
    const brandingSettings: Record<string, string> = {
      shop_name: SHOP_NAME,
      shop_phone: SHOP_PHONE,
      shop_address: SHOP_ADDRESS,
      shop_instagram: SHOP_INSTAGRAM,
      logo_url: '/logo.jpeg',
    }

    for (const [key, value] of Object.entries(brandingSettings)) {
      if (!value) continue
      await prisma.settings.upsert({
        where: { tenantId_key: { tenantId: tenant.id, key } },
        create: { tenantId: tenant.id, key, value },
        update: {},
      })
    }
    console.log('Identidade/branding da loja configurada.')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
