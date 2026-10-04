import { api } from './axios'

export interface Plan {
  id: string
  name: string
  description?: string | null
  price: number | string
  serviceIds: string[]
  usesPerCycle: number | null
  isActive: boolean
}
export interface SubscriptionCharge {
  id: string
  periodStart: string
  periodEnd: string
  amount: number | string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  paidAt: string | null
  pix: { status: string; qrCode: string | null; link: string; expiresAt: string } | null
}
export interface Subscription {
  id: string
  status: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'
  priceSnapshot: number | string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  client: { id: string; name: string; phone: string }
  plan: Plan
  uses: number
  charges: SubscriptionCharge[]
}
export interface AppointmentSubscription {
  id: string
  plan: string
  status: string
  usesPerCycle: number | null
  uses: number
  periodEnd: string
  applied: boolean
}

export const listPlans = async (): Promise<Plan[]> => (await api.get('/subscriptions/plans')).data
export const savePlan = async (plan: Partial<Plan> & { id?: string }) => {
  const { id, ...body } = plan
  return id
    ? (await api.patch(`/subscriptions/plans/${id}`, body)).data
    : (await api.post('/subscriptions/plans', body)).data
}
export const listSubscriptions = async (): Promise<Subscription[]> =>
  (await api.get('/subscriptions')).data
export const createSubscription = async (input: {
  clientId: string
  planId: string
  startsAt?: string
}) => (await api.post('/subscriptions', input)).data
export const cancelSubscription = async (id: string) =>
  (await api.post(`/subscriptions/${id}/cancel`)).data
export const resendPix = async (chargeId: string): Promise<{ link: string }> =>
  (await api.post(`/subscriptions/charges/${chargeId}/pix`)).data
export const payManually = async (chargeId: string, method: string) =>
  (await api.post(`/subscriptions/charges/${chargeId}/manual`, { method })).data
export const getAppointmentSubscription = async (
  appointmentId: string,
): Promise<AppointmentSubscription | null> =>
  (await api.get(`/subscriptions/appointments/${appointmentId}`)).data
export const applySubscription = async (appointmentId: string) =>
  (await api.post(`/subscriptions/appointments/${appointmentId}`)).data
export const removeSubscription = async (appointmentId: string) =>
  (await api.delete(`/subscriptions/appointments/${appointmentId}`)).data
