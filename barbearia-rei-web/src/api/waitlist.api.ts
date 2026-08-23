import { api } from './axios'
import type { WaitlistEntry, WaitlistStatus, PaginatedResponse } from '../types'

export async function listWaitlist(
  status?: WaitlistStatus,
  page = 1,
  limit = 50,
): Promise<PaginatedResponse<WaitlistEntry>> {
  const { data } = await api.get('/waitlist', { params: { status, page, limit } })
  return data
}

export async function createWaitlistEntry(input: {
  clientId: string
  barberId?: string
  serviceId?: string
  preferredDate: string
  notes?: string
}): Promise<WaitlistEntry> {
  const { data } = await api.post('/waitlist', input)
  return data.data
}

export async function updateWaitlistStatus(id: string, status: WaitlistStatus): Promise<WaitlistEntry> {
  const { data } = await api.patch(`/waitlist/${id}/status`, { status })
  return data.data
}

export async function deleteWaitlistEntry(id: string): Promise<void> {
  await api.delete(`/waitlist/${id}`)
}
