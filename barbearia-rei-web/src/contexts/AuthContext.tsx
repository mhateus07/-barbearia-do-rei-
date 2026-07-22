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

  const setSession = useCallback((token: string, admin: Admin) => {
    localStorage.setItem('token', token)
    localStorage.setItem('admin', JSON.stringify(admin))
    setAdmin(admin)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password)
    setSession(result.token, result.admin)
  }, [setSession])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}
