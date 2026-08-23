import { z } from 'zod'
import { WaitlistStatus } from '@prisma/client'

export const createWaitlistEntrySchema = z.object({
  clientId: z.string().uuid(),
  barberId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  preferredDate: z.string().min(1, 'Data obrigatória'),
  notes: z.string().optional(),
})

export const updateWaitlistStatusSchema = z.object({
  status: z.nativeEnum(WaitlistStatus),
})

export type CreateWaitlistEntryInput = z.infer<typeof createWaitlistEntrySchema>
export type UpdateWaitlistStatusInput = z.infer<typeof updateWaitlistStatusSchema>
