import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@barbeariadorei.com' },
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: {
        name: 'Administrador',
        email: 'admin@barbeariadorei.com',
        passwordHash,
      },
    })
    console.log('Admin criado: admin@barbeariadorei.com / admin123')
  } else {
    console.log('Admin já existe.')
  }

  const services = await prisma.service.count()
  if (services === 0) {
    await prisma.service.createMany({
      data: [
        { name: 'Corte Simples', price: 35.0, durationMin: 30 },
        { name: 'Corte + Barba', price: 55.0, durationMin: 50 },
        { name: 'Barba', price: 25.0, durationMin: 20 },
        { name: 'Sobrancelha', price: 15.0, durationMin: 15 },
        { name: 'Pigmentação', price: 80.0, durationMin: 60, description: 'Pigmentação capilar' },
      ],
    })
    console.log('Serviços de exemplo criados.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
