import { describe, it, expect } from 'vitest'
import { scopeArgsToTenant, TENANT_SCOPED_MODELS } from '../prisma'

const TENANT_ID = 'tenant-abc'

describe('scopeArgsToTenant (isolamento por tenant)', () => {
  it('injeta tenantId no where de findMany, sem apagar filtros existentes', () => {
    const result = scopeArgsToTenant('findMany', { where: { isActive: true } }, TENANT_ID)
    expect(result).toEqual({ where: { isActive: true, tenantId: TENANT_ID } })
  })

  it('injeta tenantId no where mesmo quando não há where original', () => {
    const result = scopeArgsToTenant('findMany', {}, TENANT_ID)
    expect(result).toEqual({ where: { tenantId: TENANT_ID } })
  })

  it.each([
    'findFirst',
    'findFirstOrThrow',
    'count',
    'aggregate',
    'groupBy',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
  ])('injeta tenantId no where de %s', (operation) => {
    const result = scopeArgsToTenant(operation, { where: { id: 'x' } }, TENANT_ID)
    expect(result).toEqual({ where: { id: 'x', tenantId: TENANT_ID } })
  })

  it('um atacante não consegue sobrescrever tenantId via where — o tenantId do contexto sempre vence por último', () => {
    // Simula um payload malicioso tentando forçar acesso a outro tenant
    // through um `where.tenantId` arbitrário vindo de fora.
    const result = scopeArgsToTenant('findMany', { where: { tenantId: 'tenant-outro' } }, TENANT_ID)
    expect((result!.where as Record<string, unknown>).tenantId).toBe(TENANT_ID)
  })

  it('injeta tenantId no data de create', () => {
    const result = scopeArgsToTenant('create', { data: { name: 'Pedro' } }, TENANT_ID)
    expect(result).toEqual({ data: { name: 'Pedro', tenantId: TENANT_ID } })
  })

  it('um atacante não consegue criar um registro em nome de outro tenant via data.tenantId', () => {
    const result = scopeArgsToTenant(
      'create',
      { data: { name: 'Pedro', tenantId: 'tenant-outro' } },
      TENANT_ID,
    )
    expect((result!.data as Record<string, unknown>).tenantId).toBe(TENANT_ID)
  })

  it('injeta tenantId em cada item de createMany quando data é array', () => {
    const result = scopeArgsToTenant(
      'createMany',
      { data: [{ name: 'A' }, { name: 'B', tenantId: 'tenant-outro' }] },
      TENANT_ID,
    )
    expect(result).toEqual({
      data: [
        { name: 'A', tenantId: TENANT_ID },
        { name: 'B', tenantId: TENANT_ID },
      ],
    })
  })

  it('injeta tenantId no data de createMany quando data é um único objeto', () => {
    const result = scopeArgsToTenant('createMany', { data: { name: 'A' } }, TENANT_ID)
    expect(result).toEqual({ data: { name: 'A', tenantId: TENANT_ID } })
  })

  it('injeta tenantId só no create de upsert, preservando o where (chave única)', () => {
    const result = scopeArgsToTenant(
      'upsert',
      {
        where: { tenantId_key: { tenantId: TENANT_ID, key: 'shop_name' } },
        create: { key: 'shop_name', value: 'Loja' },
        update: { value: 'Loja Nova' },
      },
      TENANT_ID,
    )
    expect(result).toEqual({
      where: { tenantId_key: { tenantId: TENANT_ID, key: 'shop_name' } },
      create: { key: 'shop_name', value: 'Loja', tenantId: TENANT_ID },
      update: { value: 'Loja Nova' },
    })
  })

  it('retorna null para operações não mapeadas (ex.: findUnique é tratado à parte, fora desta função)', () => {
    expect(scopeArgsToTenant('findUnique', { where: { id: 'x' } }, TENANT_ID)).toBeNull()
    expect(scopeArgsToTenant('executeRaw', {}, TENANT_ID)).toBeNull()
  })
})

describe('TENANT_SCOPED_MODELS', () => {
  it('inclui todos os modelos de negócio que carregam dado de um tenant específico', () => {
    for (const model of [
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
    ]) {
      expect(TENANT_SCOPED_MODELS.has(model)).toBe(true)
    }
  })

  it('não inclui Tenant — o próprio identificador do tenant não é escopado por si mesmo', () => {
    expect(TENANT_SCOPED_MODELS.has('Tenant')).toBe(false)
  })
})
