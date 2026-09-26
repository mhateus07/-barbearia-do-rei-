import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export interface SalonContext {
  slug: string
  db: PrismaClient
}
export const salonContext = new AsyncLocalStorage<SalonContext>()
const configs: Record<string, string> = process.env.SALON_DATABASES
  ? JSON.parse(process.env.SALON_DATABASES)
  : {
      [process.env.DEFAULT_SALON || 'barbearia-do-rei']:
        process.env.DATABASE_URL!,
    }
if (!Object.keys(configs).length) throw new Error('Configure ao menos um salão')
const identities = Object.values(configs).map((value) => {
  const url = new URL(value)
  return `${url.hostname}:${url.port || '5432'}${url.pathname}`
})
if (new Set(identities).size !== identities.length)
  throw new Error('Cada salão deve possuir seu próprio banco')
export const salons = new Map<string, SalonContext>(
  Object.entries(configs).map(([slug, url]) => {
    if (!/^[a-z0-9-]{1,64}$/.test(slug))
      throw new Error('Slug de salão inválido')
    return [
      slug,
      {
        slug,
        db: new PrismaClient({
          adapter: new PrismaPg({ connectionString: url, max: 5 }),
        }),
      },
    ]
  }),
)
export function currentSalon() {
  const context = salonContext.getStore()
  if (!context) throw new Error('Contexto de salão obrigatório')
  return context
}
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const db = currentSalon().db
    const value = Reflect.get(db, prop)
    return typeof value === 'function' ? value.bind(db) : value
  },
})
