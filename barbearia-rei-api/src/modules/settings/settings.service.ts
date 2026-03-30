import { prisma } from '../../lib/prisma'
import { SETTING_DEFAULTS, UpdateSettingsInput } from './settings.schema'

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.settings.findMany()
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  // Merge com defaults: database tem prioridade
  return { ...SETTING_DEFAULTS, ...stored }
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.settings.findUnique({ where: { key } })
  return row?.value ?? SETTING_DEFAULTS[key] ?? ''
}

export async function updateSettings(input: UpdateSettingsInput): Promise<Record<string, string>> {
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
