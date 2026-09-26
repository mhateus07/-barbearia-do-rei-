import { getSalon } from './salon'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
export const publicApi = axios.create({ baseURL: `${BASE}/public` })
const api = publicApi
api.interceptors.request.use((config) => {
  config.headers['X-Salon'] = getSalon()
  return config
})

export interface PublicService {
  id: string
  name: string
  description?: string
  price: number
  durationMin: number
  processingMin: number
  finishingMin: number
}

export interface PublicBarber {
  id: string
  name: string
  avatarUrl?: string
  serviceIds: string[]
  serviceOverrides: Record<string, { price?: number; durationMin?: number }>
}

export interface PublicInfo {
  shopLogo: string
  shopDescription: string
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

export async function getAvailableSlots(
  barberId: string,
  date: string,
  duration: number,
  serviceIds: string[],
): Promise<string[]> {
  const { data } = await api.get(`/barbers/${barberId}/slots`, {
    params: { date, duration, serviceIds: serviceIds.join(',') },
  })
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
  outreachToken?: string
  notes?: string
}) {
  const { data } = await api.post('/appointments', payload)
  return data
}
