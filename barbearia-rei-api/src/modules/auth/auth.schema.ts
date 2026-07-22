import { z } from 'zod'

export const loginSchema = z.object({
  slug: z.string().min(1, 'Informe o endereço da sua barbearia'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
