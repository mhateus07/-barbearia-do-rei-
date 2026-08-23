import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Admin } from '../types'
import { login as loginApi } from '../api/auth.api'
import { AuthContext } from './auth-context'

function getStoredAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem('admin')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin)
  const [tenantSlug, setTenantSlug] = useState<string | null>(() => localStorage.getItem('tenantSlug'))

  const setSession = useCallback((token: string, admin: Admin, tenantSlug: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('admin', JSON.stringify(admin))
    localStorage.setItem('tenantSlug', tenantSlug)
    setAdmin(admin)
    setTenantSlug(tenantSlug)
  }, [])

  const login = useCallback(
    async (slug: string, email: string, password: string) => {
      const result = await loginApi(slug, email, password)
      setSession(result.token, result.admin, result.tenant.slug)
    },
    [setSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    localStorage.removeItem('tenantSlug')
    setAdmin(null)
    setTenantSlug(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, tenantSlug, isAuthenticated: !!admin, login, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}
