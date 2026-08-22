import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getTenantId } from './tenant-context'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const basePrisma = new PrismaClient({ adapter })

// Modelos de negócio isolados por tenant. `Tenant` (identidade do tenant) e
// `AppointmentService` (sempre acessado através de Appointment, já filtrado)
// ficam de fora de propósito.
export const TENANT_SCOPED_MODELS = new Set([
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
  'WaitlistEntry',
])

function uncapitalize(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

export type AnyArgs = Record<string, unknown>

/**
 * Transforma os args de uma operação Prisma pra injetar o tenantId do
 * contexto atual, de acordo com a operação. Extraída de `$allOperations` pra
 * poder ser testada isoladamente (sem precisar de um PrismaClient real/DB) —
 * é a peça que efetivamente impede vazamento cross-tenant, então precisa de
 * cobertura de teste direta.
 *
 * Retorna `null` quando a operação não precisa (ou não sabe como) injetar
 * tenantId — nesse caso o chamador deve executar a query com os args
 * originais.
 */
export function scopeArgsToTenant(operation: string, args: AnyArgs, tenantId: string): AnyArgs | null {
  switch (operation) {
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
      return {
        ...args,
        where: { ...(args.where as AnyArgs | undefined), tenantId },
      }
    case 'create':
      return {
        ...args,
        data: { ...(args.data as AnyArgs), tenantId },
      }
    case 'createMany': {
      const data = args.data as AnyArgs | AnyArgs[]
      return {
        ...args,
        data: Array.isArray(data) ? data.map((d) => ({ ...d, tenantId })) : { ...data, tenantId },
      }
    }
    case 'upsert':
      // `where` do upsert precisa ser a chave única exata (já inclui
      // tenantId quando a chave é composta); só a criação precisa do
      // tenantId injetado.
      return {
        ...args,
        create: { ...(args.create as AnyArgs), tenantId },
      }
    default:
      return null
  }
}

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

        if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
          const delegate = (
            basePrisma as unknown as Record<string, Record<string, (args: unknown) => unknown>>
          )[uncapitalize(model)]
          const nextOp = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow'
          return delegate[nextOp]({
            ...a,
            where: { ...(a.where as AnyArgs | undefined), tenantId },
          })
        }

        const scoped = scopeArgsToTenant(operation, a, tenantId)
        return runQuery(scoped ?? args)
      },
    },
  },
})
