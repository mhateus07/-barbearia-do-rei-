import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Admin } from '../types'
import { login as loginApi } from '../api/auth.api'

interface AuthContextValue {
  admin: Admin | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

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

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password)
    localStorage.setItem('token', result.token)
    localStorage.setItem('admin', JSON.stringify(result.admin))
    setAdmin(result.admin)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
