import { api } from './axios'
import type { Admin } from '../types'

export interface SignupInput {
  shopName: string
  slug: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export interface SignupResult {
  token: string
  admin: Admin
  tenant: { id: string; slug: string; name: string }
}

export async function signup(input: SignupInput): Promise<SignupResult> {
  const { data } = await api.post('/onboarding/signup', input)
  return data.data
}
