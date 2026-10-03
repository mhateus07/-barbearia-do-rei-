import { api } from './axios'
import type { Service } from '../types'

export async function listServices(isActive?: boolean): Promise<Service[]> {
  const { data } = await api.get('/services', { params: { isActive } })
  return data.data
}

export async function createService(input: Partial<Service>): Promise<Service> {
  const { data } = await api.post('/services', input)
  return data.data
}

export async function updateService(id: string, input: Partial<Service>): Promise<Service> {
  const { data } = await api.patch(`/services/${id}`, input)
  return data.data
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`)
}
