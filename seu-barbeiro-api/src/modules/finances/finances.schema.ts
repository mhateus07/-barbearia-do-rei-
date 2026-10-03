import { z } from 'zod'
import { PaymentMethod, ExpenseCategory, ExpenseStatus } from '@prisma/client'

export const createPaymentSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.string().min(1).optional(),
  notes: z.string().optional(),
  appointmentId: z.string().uuid().optional(),
})

export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.nativeEnum(ExpenseCategory),
  dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
  notes: z.string().optional(),
})

export const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  dueDate: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
})

export const payExpenseSchema = z.object({
  paidAt: z.string().min(1).optional(),
})

export const payCommissionSchema = z.object({
  barberId: z.string().uuid('ID do barbeiro inválido'),
  periodFrom: z.string().min(1, 'Data inicial obrigatória'),
  periodTo: z.string().min(1, 'Data final obrigatória'),
  totalRevenue: z.number().nonnegative(),
  commissionAmount: z.number().nonnegative(),
  commissionRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type PayExpenseInput = z.infer<typeof payExpenseSchema>
export type PayCommissionInput = z.infer<typeof payCommissionSchema>
