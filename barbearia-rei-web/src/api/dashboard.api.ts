import { api } from './axios'
import type { DashboardSummary } from '../types'

export interface DashboardStats {
  revenueByDay: { date: string; total: number }[]
  topServices: { name: string; count: number; revenue: number }[]
  topBarbers: { name: string; count: number }[]
  appointmentsByStatus: { status: string; count: number }[]
}

export async function getDashboardSummary(date?: string): Promise<DashboardSummary> {
  const { data } = await api.get('/dashboard/summary', { params: { date } })
  return data.data
}

export async function getDashboardStats(from?: string, to?: string): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard/stats', { params: { from, to } })
  return data.data
}
