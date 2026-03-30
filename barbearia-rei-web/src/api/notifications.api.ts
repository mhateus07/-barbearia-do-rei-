import { api } from './axios'
import type { NotificationLog, NotificationStatus, NotificationType, PaginatedResponse } from '../types'

export async function listNotificationLogs(filters: {
  status?: NotificationStatus
  type?: NotificationType
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponse<NotificationLog>> {
  const { data } = await api.get('/notifications', { params: filters })
  return data
}

export async function sendCustomNotification(params: {
  phone: string
  message: string
  clientId?: string
  appointmentId?: string
}): Promise<{ log: NotificationLog; sent: boolean; error?: string }> {
  const { data } = await api.post('/notifications/send', params)
  return data.data
}

export async function sendReminders(): Promise<{ sent: number; failed: number }> {
  const { data } = await api.post('/notifications/send-reminders')
  return data.data
}
