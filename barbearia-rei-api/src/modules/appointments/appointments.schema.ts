import { z } from 'zod'
import { AppointmentStatus } from '@prisma/client'

export const createAppointmentSchema = z.object({
  clientId: z.string().uuid(),
  barberId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um serviço'),
  startsAt: z.string().min(1, 'Data/hora obrigatória'),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  clientId: z.string().uuid().optional(),
  barberId: z.string().uuid().optional(),
  serviceIds: z.array(z.string().uuid()).min(1).optional(),
  startsAt: z.string().min(1).optional(),
  notes: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
