import { createContext, useContext } from 'react'
import type { Admin } from '../types'

export interface AuthContextValue {
  admin: Admin | null
  tenantSlug: string | null
  isAuthenticated: boolean
  login: (slug: string, email: string, password: string) => Promise<void>
  logout: () => void
  setSession: (token: string, admin: Admin, tenantSlug: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
