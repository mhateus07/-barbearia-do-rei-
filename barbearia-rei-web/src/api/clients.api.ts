import { api } from './axios'
import type { Client, PaginatedResponse } from '../types'

export async function listClients(
  search?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Client>> {
  const { data } = await api.get('/clients', { params: { search, page, limit } })
  return data
}

export async function createClient(input: Partial<Client>): Promise<Client> {
  const { data } = await api.post('/clients', input)
  return data.data
}

export async function updateClient(id: string, input: Partial<Client>): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, input)
  return data.data
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`)
}
