import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function getDashboardSummary(date?: string) {
  const targetDate = date ? new Date(date) : new Date()
  const start = new Date(targetDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(targetDate)
  end.setHours(23, 59, 59, 999)

  const [appointments, upcoming] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: start, lte: end } },
      include: {
        client: { select: { id: true, name: true } },
        barber: { select: { id: true, name: true } },
        services: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: new Date() },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      },
      include: {
        client: { select: { id: true, name: true } },
        barber: { select: { id: true, name: true } },
        services: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startsAt: 'asc' },
      take: 5,
    }),
  ])

  const completed = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED)
  const cancelled = appointments.filter((a) => a.status === AppointmentStatus.CANCELLED)
  const noShow = appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW)
  const revenueToday = completed.reduce((sum, a) => sum + Number(a.totalPrice), 0)

  return {
    totalAppointments: appointments.length,
    completed: completed.length,
    cancelled: cancelled.length,
    noShow: noShow.length,
    revenueToday,
    upcomingToday: upcoming,
  }
}

export async function getDashboardStats(from?: string, to?: string) {
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const endDate = to ? new Date(to) : new Date()

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startDate, lte: endDate },
      status: AppointmentStatus.COMPLETED,
    },
    include: {
      services: { include: { service: { select: { id: true, name: true } } } },
      barber: { select: { id: true, name: true } },
    },
  })

  // Receita por dia
  const revenueByDay: Record<string, number> = {}
  appointments.forEach((a) => {
    const day = a.startsAt.toISOString().split('T')[0]
    revenueByDay[day] = (revenueByDay[day] || 0) + Number(a.totalPrice)
  })

  // Top serviços
  const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {}
  appointments.forEach((a) => {
    a.services.forEach((as) => {
      const id = as.service.id
      if (!serviceCount[id]) serviceCount[id] = { name: as.service.name, count: 0, revenue: 0 }
      serviceCount[id].count++
      serviceCount[id].revenue += Number(as.priceSnapshot)
    })
  })

  // Top barbeiros
  const barberCount: Record<string, { name: string; count: number }> = {}
  appointments.forEach((a) => {
    const id = a.barber.id
    if (!barberCount[id]) barberCount[id] = { name: a.barber.name, count: 0 }
    barberCount[id].count++
  })

  const allAppointments = await prisma.appointment.groupBy({
    by: ['status'],
    where: { startsAt: { gte: startDate, lte: endDate } },
    _count: { status: true },
  })

  return {
    revenueByDay: Object.entries(revenueByDay).map(([date, total]) => ({ date, total })),
    topServices: Object.values(serviceCount).sort((a, b) => b.count - a.count).slice(0, 5),
    topBarbers: Object.values(barberCount).sort((a, b) => b.count - a.count),
    appointmentsByStatus: allAppointments.map((g) => ({
      status: g.status,
      count: g._count.status,
    })),
  }
}
