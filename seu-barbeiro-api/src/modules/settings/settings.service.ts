import { prisma } from '../../lib/prisma'
import { SETTING_DEFAULTS, UpdateSettingsInput } from './settings.schema'

export async function getSettings(
  db: Pick<typeof prisma, 'settings'> = prisma,
): Promise<Record<string, string>> {
  const rows = await db.settings.findMany()
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  // Merge com defaults: database tem prioridade
  return { ...SETTING_DEFAULTS, ...stored }
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.settings.findUnique({ where: { key } })
  return row?.value ?? SETTING_DEFAULTS[key] ?? ''
}

export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<Record<string, string>> {
  for (const [key, value] of Object.entries(input.settings)) {
    if (!(key in SETTING_DEFAULTS)) throw new Error('Configuração desconhecida')
    if (
      key.startsWith('hours_') &&
      value !== 'closed' &&
      !/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(value)
    )
      throw new Error('Expediente inválido')
    if (
      [
        'loyalty_points_per_visit',
        'loyalty_redemption_points',
        'loyalty_redemption_value',
        'whatsapp_reminder_hours',
        'deposit_value',
        'deposit_expire_minutes',
      ].includes(key) &&
      (!Number.isFinite(Number(value)) || Number(value) <= 0)
    )
      throw new Error('Valor de configuração inválido')
    if (key === 'shop_logo' && value && !value.startsWith('https://'))
      throw new Error('Use uma URL HTTPS para o logo')
    if (key === 'deposit_mode' && !['off', 'all', 'no_show'].includes(value))
      throw new Error('Modo de sinal inválido')
    if (key === 'deposit_type' && !['percent', 'fixed'].includes(value))
      throw new Error('Tipo de sinal inválido')
    if (
      key === 'deposit_expire_minutes' &&
      (!Number.isInteger(Number(value)) || Number(value) < 10 || Number(value) > 1440)
    )
      throw new Error('Prazo do sinal deve ficar entre 10 e 1440 minutos')
    if (
      ['client_change_min_hours', 'subscription_notice_days', 'subscription_grace_days'].includes(key) &&
      (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 72)
    )
      throw new Error('Valor de configuração inválido')
    if (key === 'mp_access_token' && value && !/^(APP_USR|TEST)-[\w-]{20,}$/.test(value))
      throw new Error('Token do Mercado Pago inválido. Use o "Access Token" de produção.')
  }
  const ops = Object.entries(input.settings).map(([key, value]) =>
    prisma.settings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    }),
  )
  await prisma.$transaction(ops)
  return getSettings()
}
