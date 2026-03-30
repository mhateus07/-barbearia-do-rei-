import { z } from 'zod'

export const updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.string()),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

// Valores padrão das configurações
export const SETTING_DEFAULTS: Record<string, string> = {
  shop_name: 'Barbearia do Rei',
  shop_phone: '(32) 99160-8852',
  shop_address: 'Rua Jose Narcisio Silva 1003, Fabricas, São João del Rei, MG',
  shop_instagram: '@opedro.seubarbeiro',
  hours_monday: '08:00-19:00',
  hours_tuesday: '08:00-19:00',
  hours_wednesday: '08:00-19:00',
  hours_thursday: '08:00-19:00',
  hours_friday: '08:00-19:00',
  hours_saturday: '08:00-16:00',
  hours_sunday: 'closed',
  loyalty_enabled: 'true',
  loyalty_points_per_visit: '10',
  loyalty_redemption_points: '100',
  loyalty_redemption_value: '10',
  whatsapp_enabled: 'false',
  whatsapp_api_url: '',
  whatsapp_api_key: '',
  whatsapp_instance: '',
  whatsapp_reminder_hours: '24',
}
