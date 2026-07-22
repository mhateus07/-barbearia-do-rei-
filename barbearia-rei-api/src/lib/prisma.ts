import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getTenantId } from './tenant-context'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const basePrisma = new PrismaClient({ adapter })

// Modelos de negócio isolados por tenant. `Tenant` (identidade do tenant) e
// `AppointmentService` (sempre acessado através de Appointment, já filtrado)
// ficam de fora de propósito.
const TENANT_SCOPED_MODELS = new Set([
  'Admin',
  'Barber',
  'Service',
  'Client',
  'Appointment',
  'Payment',
  'Expense',
  'Settings',
  'LoyaltyCard',
  'CommissionPayment',
  'NotificationLog',
])

function uncapitalize(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

type AnyArgs = Record<string, unknown>

/**
 * Injeta o tenantId do contexto atual (AsyncLocalStorage) em toda operação
 * Prisma sobre um modelo de negócio, para que nenhum service precise repetir
 * `where: { tenantId }` manualmente. `findUnique`/`findUniqueOrThrow` viram
 * `findFirst`/`findFirstOrThrow` porque seu `where` só aceita campos
 * unicamente identificáveis, e campos como `email`/`phone`/`key` deixaram de
 * ser únicos globalmente (agora são únicos por tenant).
 */
export const prisma = basePrisma.$extends({
  name: 'tenant-scoping',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !TENANT_SCOPED_MODELS.has(model)) {
          return query(args)
        }

        const tenantId = getTenantId()
        const a = args as AnyArgs
        // Dispatch dinâmico por model/operation: a shape exata de `args` varia
        // por modelo e o TS não consegue estreitar isso aqui, então tratamos
        // como dado dinâmico e confiamos na cobertura dos testes/migrações.
        const runQuery = query as (args: AnyArgs) => Promise<unknown>

        switch (operation) {
          case 'findUnique':
          case 'findUniqueOrThrow': {
            const delegate = (basePrisma as unknown as Record<string, Record<string, (args: unknown) => unknown>>)[
              uncapitalize(model)
            ]
            const nextOp = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow'
            return delegate[nextOp]({
              ...a,
              where: { ...(a.where as AnyArgs | undefined), tenantId },
            })
          }
          case 'findFirst':
          case 'findFirstOrThrow':
          case 'findMany':
          case 'count':
          case 'aggregate':
          case 'groupBy':
          case 'update':
          case 'updateMany':
          case 'delete':
          case 'deleteMany':
            return runQuery({
              ...a,
              where: { ...(a.where as AnyArgs | undefined), tenantId },
            })
          case 'create':
            return runQuery({
              ...a,
              data: { ...(a.data as AnyArgs), tenantId },
            })
          case 'createMany': {
            const data = a.data as AnyArgs | AnyArgs[]
            return runQuery({
              ...a,
              data: Array.isArray(data) ? data.map((d) => ({ ...d, tenantId })) : { ...data, tenantId },
            })
          }
          case 'upsert':
            // `where` do upsert precisa ser a chave única exata (já inclui
            // tenantId quando a chave é composta); só a criação precisa do
            // tenantId injetado.
            return runQuery({
              ...a,
              create: { ...(a.create as AnyArgs), tenantId },
            })
          default:
            return query(args)
        }
      },
    },
  },
})
