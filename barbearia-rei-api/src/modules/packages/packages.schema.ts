import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'

export const createPackageSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  serviceId: z.string().uuid('Serviço inválido'),
  totalSessions: z.number().int().positive('Deve ter ao menos 1 sessão'),
  price: z.number().positive('Valor deve ser positivo'),
  validityDays: z.number().int().positive().optional(),
})

export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  totalSessions: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  validityDays: z.number().int().positive().nullable().optional(),
})

export const sellPackageSchema = z.object({
  clientId: z.string().uuid(),
  packageId: z.string().uuid(),
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
})

export type CreatePackageInput = z.infer<typeof createPackageSchema>
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
export type SellPackageInput = z.infer<typeof sellPackageSchema>
