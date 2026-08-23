import { api } from './axios'
import type { Package, ClientPackage, PaymentMethod } from '../types'

export async function listPackages(isActive?: boolean): Promise<Package[]> {
  const { data } = await api.get('/packages', { params: { isActive } })
  return data.data
}

export async function createPackage(input: {
  name: string
  description?: string
  serviceId: string
  totalSessions: number
  price: number
  validityDays?: number
}): Promise<Package> {
  const { data } = await api.post('/packages', input)
  return data.data
}

export async function updatePackage(
  id: string,
  input: Partial<{
    name: string
    description: string
    serviceId: string
    totalSessions: number
    price: number
    validityDays: number | null
  }>,
): Promise<Package> {
  const { data } = await api.patch(`/packages/${id}`, input)
  return data.data
}

export async function deactivatePackage(id: string): Promise<void> {
  await api.delete(`/packages/${id}`)
}

export async function sellPackage(input: {
  clientId: string
  packageId: string
  method: PaymentMethod
  notes?: string
}): Promise<ClientPackage> {
  const { data } = await api.post('/packages/sell', input)
  return data.data
}

export async function listClientPackages(clientId: string): Promise<ClientPackage[]> {
  const { data } = await api.get(`/clients/${clientId}/packages`)
  return data.data
}
