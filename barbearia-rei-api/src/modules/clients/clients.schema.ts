import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8, 'Telefone inválido'),
  email: z.string().email().optional().or(z.literal('')),
  birthDate: z.string().datetime().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
