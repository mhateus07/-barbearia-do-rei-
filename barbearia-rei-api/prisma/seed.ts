import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@barbeariadorei.com' },
  })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: { name: 'Administrador', email: 'admin@barbeariadorei.com', passwordHash },
    })
    console.log('Admin criado: admin@barbeariadorei.com / admin123')
  }

  // Barbeiro Pedro
  const existingBarber = await prisma.barber.findFirst({ where: { name: 'Pedro Miguel' } })
  if (!existingBarber) {
    await prisma.barber.create({
      data: {
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
        { name: 'Corte de Cabelo', price: 40.00, durationMin: 30, description: 'Corte clássico ou moderno' },
        { name: 'Barba', price: 30.00, durationMin: 30, description: 'Modelagem e acabamento de barba' },
        { name: 'Barba na Toalha Quente', price: 35.00, durationMin: 30, description: 'Barba com tratamento de toalha quente' },
        { name: 'Cabelo + Sobrancelha', price: 45.00, durationMin: 30, description: 'Corte de cabelo com design de sobrancelha' },
        { name: 'Cabelo + Barba + Sobrancelha', price: 80.00, durationMin: 60, description: 'Pacote completo com toalha quente' },
        { name: 'Perfil (Pezinho)', price: 15.00, durationMin: 10, description: 'Acabamento do perfil' },
      ],
    })
    console.log('Serviços reais criados.')
  } else {
    console.log(`${serviceCount} serviço(s) já cadastrado(s). Pulando.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
