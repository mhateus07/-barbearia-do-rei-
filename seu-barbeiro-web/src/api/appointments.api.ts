import { api } from './axios'
import type { Appointment, AppointmentStatus, PaginatedResponse } from '../types'

interface AppointmentFilters {
  date?: string
  from?: string
  to?: string
  barberId?: string
  clientId?: string
  status?: AppointmentStatus
  page?: number
  limit?: number
}

export async function listAppointments(
  filters: AppointmentFilters = {},
): Promise<PaginatedResponse<Appointment>> {
  const { data } = await api.get('/appointments', { params: filters })
  return data
}

export async function createAppointment(input: {
  clientId: string
  barberId: string
  serviceIds: string[]
  startsAt: string
  notes?: string
}): Promise<Appointment> {
  const { data } = await api.post('/appointments', input)
  return data.data
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}/status`, { status })
  return data.data
}

export async function updateAppointment(
  id: string,
  input: Partial<{
    clientId: string
    barberId: string
    serviceIds: string[]
    startsAt: string
    notes: string
  }>,
): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}`, input)
  return data.data
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`)
}
