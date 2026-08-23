import { api } from './axios'
import type { Subscription, SubscriptionPayment } from '../types'

export async function getSubscription(): Promise<Subscription> {
  const { data } = await api.get('/billing/subscription')
  return data.data
}

export async function getSubscriptionPayments(): Promise<SubscriptionPayment[]> {
  const { data } = await api.get('/billing/subscription/payments')
  return data.data
}

export async function startCardCheckout(): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post('/billing/subscription/checkout/card')
  return data.data
}

export async function startPixCheckout(): Promise<SubscriptionPayment> {
  const { data } = await api.post('/billing/subscription/checkout/pix')
  return data.data
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await api.post('/billing/subscription/cancel')
  return data.data
}
