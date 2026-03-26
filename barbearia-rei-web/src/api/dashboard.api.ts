import { api } from './axios'
import type { DashboardSummary } from '../types'

export async function getDashboardSummary(date?: string): Promise<DashboardSummary> {
  const { data } = await api.get('/dashboard/summary', { params: { date } })
  return data.data
}

export async function getDashboardStats(from?: string, to?: string) {
  const { data } = await api.get('/dashboard/stats', { params: { from, to } })
  return data.data
}
