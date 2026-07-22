import { api } from './axios'
import type { Admin } from '../types'

export interface LoginResult {
  token: string
  admin: Admin
  tenant: { id: string; slug: string; name: string }
}

export async function login(slug: string, email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post('/auth/login', { slug, email, password })
  return data.data
}

export async function getMe(): Promise<Admin> {
  const { data } = await api.get('/auth/me')
  return data.data
}
