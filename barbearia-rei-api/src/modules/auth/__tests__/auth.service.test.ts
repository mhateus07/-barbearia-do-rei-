import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../utils/bcrypt'

vi.mock('../../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('../../../lib/tenant-context', () => ({
  getTenantId: vi.fn(() => 'tenant-1'),
  runWithTenant: (_tenantId: string, fn: () => unknown) => fn(),
}))

const { prisma } = await import('../../../lib/prisma')
const { loginService, getMeService } = await import('../auth.service')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})

describe('auth.service', () => {
  describe('loginService', () => {
    it('returns a token and admin data on valid credentials', async () => {
      const passwordHash = await hashPassword('admin123')
      prismaMock.admin.findFirst.mockResolvedValue({
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@barbeariadorei.com',
        passwordHash,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await loginService({ email: 'admin@barbeariadorei.com', password: 'admin123' })

      expect(result.token).toEqual(expect.any(String))
      expect(result.admin).toEqual({
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@barbeariadorei.com',
      })
    })

    it('rejects when the email does not exist', async () => {
      prismaMock.admin.findFirst.mockResolvedValue(null)

      await expect(
        loginService({ email: 'nao-existe@example.com', password: 'admin123' })
      ).rejects.toThrow('Credenciais inválidas')
    })

    it('rejects when the password is wrong', async () => {
      const passwordHash = await hashPassword('admin123')
      prismaMock.admin.findFirst.mockResolvedValue({
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@barbeariadorei.com',
        passwordHash,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        loginService({ email: 'admin@barbeariadorei.com', password: 'senha-errada' })
      ).rejects.toThrow('Credenciais inválidas')
    })
  })

  describe('getMeService', () => {
    it('returns the admin when found', async () => {
      prismaMock.admin.findUnique.mockResolvedValue({
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@barbeariadorei.com',
        createdAt: new Date(),
      } as never)

      const result = await getMeService('admin-1')
      expect(result.id).toBe('admin-1')
    })

    it('throws when the admin no longer exists', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null)
      await expect(getMeService('deleted-admin')).rejects.toThrow('Admin não encontrado')
    })
  })
})
