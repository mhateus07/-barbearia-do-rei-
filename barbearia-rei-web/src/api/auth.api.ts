import { api } from './axios'
import type { Admin } from '../types'

export async function login(email: string, password: string): Promise<{ token: string; admin: Admin }> {
  const { data } = await api.post('/auth/login', { email, password })
  return data.data
}

export async function getMe(): Promise<Admin> {
  const { data } = await api.get('/auth/me')
  return data.data
}
