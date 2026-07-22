import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'
import { runWithTenant } from '../src/lib/tenant-context'

const TENANT_SLUG = 'barbearia-do-rei'

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    create: { slug: TENANT_SLUG, name: 'Barbearia do Rei', status: 'ACTIVE' },
    update: {},
  })

  await runWithTenant(tenant.id, async () => {
    // Admin
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: 'admin@barbeariadorei.com' },
    })
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10)
      await prisma.admin.create({
        data: { tenantId: tenant.id, name: 'Administrador', email: 'admin@barbeariadorei.com', passwordHash },
      })
      console.log('Admin criado: admin@barbeariadorei.com / admin123')
    }

    // Barbeiro Pedro
    const existingBarber = await prisma.barber.findFirst({ where: { name: 'Pedro Miguel' } })
    if (!existingBarber) {
      await prisma.barber.create({
        data: {
          tenantId: tenant.id,
          name: 'Pedro Miguel',
          phone: '(32) 99160-8852',
          email: 'pedromigueljf@hotmail.com',
        },
      })
      console.log('Barbeiro Pedro Miguel criado.')
    }

    // Serviços reais da Barbearia do Rei
    const serviceCount = await prisma.service.count()
    if (serviceCount === 0) {
      await prisma.service.createMany({
        data: [
          { tenantId: tenant.id, name: 'Corte de Cabelo', price: 40.00, durationMin: 30, description: 'Corte clássico ou moderno' },
          { tenantId: tenant.id, name: 'Barba', price: 30.00, durationMin: 30, description: 'Modelagem e acabamento de barba' },
          { tenantId: tenant.id, name: 'Barba na Toalha Quente', price: 35.00, durationMin: 30, description: 'Barba com tratamento de toalha quente' },
          { tenantId: tenant.id, name: 'Cabelo + Sobrancelha', price: 45.00, durationMin: 30, description: 'Corte de cabelo com design de sobrancelha' },
          { tenantId: tenant.id, name: 'Cabelo + Barba + Sobrancelha', price: 80.00, durationMin: 60, description: 'Pacote completo com toalha quente' },
          { tenantId: tenant.id, name: 'Perfil (Pezinho)', price: 15.00, durationMin: 10, description: 'Acabamento do perfil' },
        ],
      })
      console.log('Serviços reais criados.')
    } else {
      console.log(`${serviceCount} serviço(s) já cadastrado(s). Pulando.`)
    }

    // Identidade/branding real da Barbearia do Rei (settings)
    const brandingSettings: Record<string, string> = {
      shop_name: 'Barbearia do Rei',
      shop_phone: '(32) 99160-8852',
      shop_address: 'Rua Jose Narcisio Silva 1003, Fabricas, São João del Rei, MG',
      shop_instagram: '@opedro.seubarbeiro',
      logo_url: '/logo.jpeg',
      portfolio_images: JSON.stringify([
        '/portfolio/75dc8c652fd64a0f91a4c6a159ef49-barbearia-do-rei-inspiration-e53ca531383f41fe9aee31babac288-booksy.jpeg',
        '/portfolio/f615664ac46d49d4afb9981372e03f-barbearia-do-rei-inspiration-0f6437cee6174298a263c0d070996c-booksy.jpeg',
        '/portfolio/fba6b49d5b62431a861f6b5fe20dc5-barbearia-do-rei-inspiration-e17a765aa2d3435bab2e9dc13eda7c-booksy.jpeg',
        '/portfolio/177bdb3b33c44c0b856a514ec9fdb5-barbearia-do-rei-inspiration-c415e770790b482b9a5caf60d316ab-booksy.jpeg',
        '/portfolio/d1a7f45a64e7414eab4b3e6fdc544e-barbearia-do-rei-inspiration-a68cd299c1fb4e83bcf779541b3c08-booksy.jpeg',
        '/portfolio/a29a58f246484c959eac004b01f653-barbearia-do-rei-inspiration-abe9b84e75324bc98f4304876a0403-booksy.jpeg',
        '/portfolio/3a94fb14a88f433180a9f4db774f5d-barbearia-do-rei-inspiration-2683a8237a0347c985b41f640efc20-booksy.jpeg',
        '/portfolio/df9e25d16ca5444ca60ecd4399a3bb-barbearia-do-rei-inspiration-fd385d576f5e422da7e0b633e30e60-booksy.jpeg',
        '/portfolio/0f22a1816bab4a9faafc2eee2f4e88-barbearia-do-rei-inspiration-6151c160bc344a2195e219f17fe484-booksy.jpeg',
        '/portfolio/ab563fbd31804dcb99613648f91887-barbearia-do-rei-inspiration-921d0cb6497d45fcb708e0dde6d742-booksy.jpeg',
        '/portfolio/43f8d9a488474942b34f382b1489a3-barbearia-do-rei-inspiration-2b8a30c279ba4ba4b53d34883abd50-booksy.jpeg',
        '/portfolio/b4c381ccfc01423abe053b414d2703-barbearia-do-rei-inspiration-5cc1b959c25f4d349bceada34d0cc5-booksy.jpeg',
        '/portfolio/9dfbeef9b32b4a56bba865c2eb5e07-barbearia-do-rei-inspiration-7dcfad4e1b5b43dbb2547519e7f877-booksy.jpeg',
        '/portfolio/88822834264a4b1bb6121f64ba2e8d-barbearia-do-rei-inspiration-f62ea71d5e6e47a3bf7843bc6d62ef-booksy.jpeg',
        '/portfolio/f6d58acc317d49d29a878465f19725-barbearia-do-rei-inspiration-8911db80819341388ea0f189ef6f74-booksy.jpeg',
        '/portfolio/bf3bddaeea454443a0cdf713dad8db-barbearia-do-rei-inspiration-477a20b36a0545ca8b1c77db7239de-booksy.jpeg',
        '/portfolio/490ed44df2e54c6b8bb72b577c42d7-barbearia-do-rei-inspiration-3ee175ec1e9d4ab587c92b7b9bb30a-booksy.jpeg',
        '/portfolio/9b021278a12d489bb6bf0b91410879-barbearia-do-rei-inspiration-93bfb3bdc3f740e9b5809c8828dad5-booksy.jpeg',
        '/portfolio/781ffe62882e49f28ac8a17a0e9711-barbearia-do-rei-inspiration-83a60c4ae1394b858a4c76a1ddab5d-booksy.jpeg',
        '/portfolio/d82aa2410d85400ca1d5d37d9f444e-barbearia-do-rei-inspiration-47295dc5d3934a9ca4233776c3e2fc-booksy.jpeg',
      ]),
    }

    for (const [key, value] of Object.entries(brandingSettings)) {
      await prisma.settings.upsert({
        where: { tenantId_key: { tenantId: tenant.id, key } },
        create: { tenantId: tenant.id, key, value },
        update: {},
      })
    }
    console.log('Identidade/branding da Barbearia do Rei configurada.')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
