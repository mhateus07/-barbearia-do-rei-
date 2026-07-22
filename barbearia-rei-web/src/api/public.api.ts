import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api/v1'
const api = axios.create({ baseURL: `${BASE}/public` })

export interface PublicService {
  id: string
  name: string
  description?: string
  price: number
  durationMin: number
}

export interface PublicBarber {
  id: string
  name: string
  avatarUrl?: string
}

export interface PublicInfo {
  shopName: string
  shopPhone: string
  shopAddress: string
  shopInstagram: string
  logoUrl: string | null
  portfolioImages: string[]
  hours: Record<string, string>
}

export async function getPublicInfo(tenantSlug: string): Promise<PublicInfo> {
  const { data } = await api.get(`/${tenantSlug}/info`)
  return data
}

export async function getPublicServices(tenantSlug: string): Promise<PublicService[]> {
  const { data } = await api.get(`/${tenantSlug}/services`)
  return data
}

export async function getPublicBarbers(tenantSlug: string): Promise<PublicBarber[]> {
  const { data } = await api.get(`/${tenantSlug}/barbers`)
  return data
}

export async function getAvailableSlots(tenantSlug: string, barberId: string, date: string, duration: number): Promise<string[]> {
  const { data } = await api.get(`/${tenantSlug}/barbers/${barberId}/slots`, { params: { date, duration } })
  return data.slots
}

export interface PublicAppointmentResult {
  id: string
  startsAt: string
  endsAt: string
  totalPrice: number
  client: { id: string; name: string; phone: string }
  barber: { id: string; name: string }
  services: { service: { id: string; name: string } }[]
}

export async function createPublicAppointment(tenantSlug: string, payload: {
  clientName: string
  clientPhone: string
  clientEmail?: string
  barberId: string
  serviceIds: string[]
  date: string
  time: string
  notes?: string
}): Promise<PublicAppointmentResult> {
  const { data } = await api.post(`/${tenantSlug}/appointments`, payload)
  return data
}
