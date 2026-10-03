import { api } from './axios'
import type { Barber } from '../types'

export async function listBarbers(isActive?: boolean): Promise<Barber[]> {
  const { data } = await api.get('/barbers', { params: { isActive } })
  return data.data
}

export async function createBarber(input: Partial<Barber>): Promise<Barber> {
  const { data } = await api.post('/barbers', input)
  return data.data
}

export async function updateBarber(id: string, input: Partial<Barber>): Promise<Barber> {
  const { data } = await api.patch(`/barbers/${id}`, input)
  return data.data
}

export async function deleteBarber(id: string): Promise<void> {
  await api.delete(`/barbers/${id}`)
}
