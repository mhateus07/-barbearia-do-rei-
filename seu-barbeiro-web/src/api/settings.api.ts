import { api } from './axios'

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await api.get('/settings')
  return data.data
}

export async function updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  const { data } = await api.patch('/settings', { settings })
  return data.data
}
