import { AsyncLocalStorage } from 'node:async_hooks'

interface TenantContext {
  tenantId: string
}

const storage = new AsyncLocalStorage<TenantContext>()

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return storage.run({ tenantId }, fn)
}

export function getTenantId(): string {
  const ctx = storage.getStore()
  if (!ctx) {
    throw new Error('getTenantId() chamado fora de um contexto de tenant (runWithTenant)')
  }
  return ctx.tenantId
}
