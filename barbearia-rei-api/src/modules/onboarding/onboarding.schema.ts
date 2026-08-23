import { z } from 'zod'

const RESERVED_SLUGS = new Set(['app', 'www', 'api', 'admin', 'painel', 'demo', 'staging', 'mail', 'ftp'])

export const signupSchema = z.object({
  shopName: z.string().min(2, 'Nome muito curto').max(80),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífen')
    .refine((s) => !RESERVED_SLUGS.has(s), 'Esse endereço é reservado, escolha outro'),
  adminName: z.string().min(2, 'Nome muito curto').max(120),
  adminEmail: z.string().email('E-mail inválido'),
  adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type SignupInput = z.infer<typeof signupSchema>
