import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
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
  hours: Record<string, string>
}

export async function getPublicInfo(): Promise<PublicInfo> {
  const { data } = await api.get('/info')
  return data
}

export async function getPublicServices(): Promise<PublicService[]> {
  const { data } = await api.get('/services')
  return data
}

export async function getPublicBarbers(): Promise<PublicBarber[]> {
  const { data } = await api.get('/barbers')
  return data
}

export async function getAvailableSlots(barberId: string, date: string, duration: number): Promise<string[]> {
  const { data } = await api.get(`/barbers/${barberId}/slots`, { params: { date, duration } })
  return data.slots
}

export async function createPublicAppointment(payload: {
  clientName: string
  clientPhone: string
  clientEmail?: string
  barberId: string
  serviceIds: string[]
  date: string
  time: string
  notes?: string
}) {
  const { data } = await api.post('/appointments', payload)
  return data
}
