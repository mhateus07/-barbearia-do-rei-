import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().optional(),
  // Domínio base — usado hoje só como fallback de subdomínio em
  // tenant.middleware.ts (a resolução principal é por slug no path,
  // ver docs/decisão em tenant.middleware.ts).
  BASE_DOMAIN: z.string().default('saas.impulsiodigital.com'),
  // Fallback de slug para ambientes sem subdomínio real (dev local em localhost).
  TENANT_DEV_SLUG: z.string().optional(),
  // Redis para as filas de jobs em background (lembretes de WhatsApp, etc).
  REDIS_URL: z.string().default('redis://localhost:6379'),
  // Diretório onde uploads (logo/portfólio) são salvos em disco, e o prefixo
  // de URL público sob o qual eles são servidos (ver app.ts).
  UPLOADS_DIR: z.string().default('uploads'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
