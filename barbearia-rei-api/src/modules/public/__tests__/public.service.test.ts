import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('../../settings/settings.service', () => ({
  getSettings: vi.fn(),
}))

vi.mock('../../../lib/tenant-context', () => ({
  getTenantId: vi.fn(() => 'tenant-1'),
  runWithTenant: (_tenantId: string, fn: () => unknown) => fn(),
}))

const { prisma } = await import('../../../lib/prisma')
const { getSettings } = await import('../../settings/settings.service')
const { getAvailableSlots, createPublicAppointment } = await import('../public.service')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
const getSettingsMock = getSettings as unknown as ReturnType<typeof vi.fn>

const BASE_SETTINGS = {
  shop_name: 'Barbearia Teste',
  shop_phone: '',
  shop_address: '',
  shop_instagram: '',
  hours_sunday: 'closed',
  hours_monday: '08:00-19:00',
  hours_tuesday: '08:00-19:00',
  hours_wednesday: '08:00-19:00',
  hours_thursday: '08:00-19:00',
  hours_friday: '08:00-19:00',
  hours_saturday: '08:00-16:00',
}

beforeEach(() => {
  mockReset(prismaMock)
  getSettingsMock.mockReset()
  getSettingsMock.mockResolvedValue(BASE_SETTINGS)
  // createPublicAppointment roda a checagem de conflito + criação dentro de
  // prisma.$transaction(async (tx) => ...); no mock, `tx` é o próprio
  // prismaMock, já que a extensão de tenant scoping é ignorada em testes.
  prismaMock.$transaction.mockImplementation((fn: unknown) =>
    typeof fn === 'function'
      ? (fn as (tx: typeof prismaMock) => unknown)(prismaMock)
      : Promise.all(fn as never),
  )
})

// Próxima segunda-feira, distante o suficiente no futuro para não colidir com "now" nos testes.
function nextMonday(): string {
  const d = new Date()
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7))
  return d.toISOString().slice(0, 10)
}

describe('public.service', () => {
  describe('getAvailableSlots', () => {
    it('returns an empty list when the shop is closed that day', async () => {
      const sunday = (() => {
        const d = new Date()
        d.setDate(d.getDate() + ((0 + 7 - d.getDay()) % 7 || 7))
        return d.toISOString().slice(0, 10)
      })()

      const slots = await getAvailableSlots('barber-1', sunday, 30)
      expect(slots).toEqual([])
    })

    it('excludes a slot that overlaps an existing appointment for that barber', async () => {
      const date = nextMonday()
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          startsAt: new Date(`${date}T09:00:00`),
          endsAt: new Date(`${date}T09:30:00`),
          barberId: 'barber-1',
        } as never,
      ])

      const slots = await getAvailableSlots('barber-1', date, 30)
      expect(slots).not.toContain('09:00')
      expect(slots).toContain('09:30')
    })

    it('with "any" barber, only excludes a slot when every active barber is busy', async () => {
      const date = nextMonday()
      prismaMock.barber.findMany.mockResolvedValue([{ id: 'barber-1' }, { id: 'barber-2' }] as never)
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          startsAt: new Date(`${date}T09:00:00`),
          endsAt: new Date(`${date}T09:30:00`),
          barberId: 'barber-1',
        },
      ] as never)

      const slots = await getAvailableSlots('any', date, 30)
      // barber-2 is free at 09:00, so the slot should still be offered
      expect(slots).toContain('09:00')
    })
  })

  describe('createPublicAppointment', () => {
    it('throws when the chosen slot conflicts with an existing appointment', async () => {
      const date = nextMonday()
      prismaMock.client.findFirst.mockResolvedValue({ id: 'client-1' } as never)
      prismaMock.service.findMany.mockResolvedValue([
        { id: 'service-1', price: 40, durationMin: 30 } as never,
      ])
      prismaMock.appointment.findFirst.mockResolvedValue({ id: 'existing-appt' } as never)

      await expect(
        createPublicAppointment({
          clientName: 'Cliente Teste',
          clientPhone: '32999999999',
          barberId: 'barber-1',
          serviceIds: ['service-1'],
          date,
          time: '09:00',
        }),
      ).rejects.toThrow('Horário não disponível')
    })

    it('rejects when a requested service is inactive or missing', async () => {
      const date = nextMonday()
      prismaMock.client.findFirst.mockResolvedValue({ id: 'client-1' } as never)
      prismaMock.service.findMany.mockResolvedValue([])

      await expect(
        createPublicAppointment({
          clientName: 'Cliente Teste',
          clientPhone: '32999999999',
          barberId: 'barber-1',
          serviceIds: ['service-inexistente'],
          date,
          time: '09:00',
        }),
      ).rejects.toThrow('Um ou mais serviços não encontrados ou inativos')
    })
  })
})
