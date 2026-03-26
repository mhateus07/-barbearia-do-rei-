import { z } from 'zod'

export const createBarberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export const updateBarberSchema = createBarberSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateBarberInput = z.infer<typeof createBarberSchema>
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>
