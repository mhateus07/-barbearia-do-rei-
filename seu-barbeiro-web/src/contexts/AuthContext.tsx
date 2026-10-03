import { AuthContext } from './auth-state'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Admin } from '../types'
import { login as loginApi } from '../api/auth.api'

function getStoredAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem('admin')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin)

  const login = useCallback(
    async (email: string, password: string) => {
      queryClient.clear()
      const result = await loginApi(email, password)
      localStorage.setItem('token', result.token)
      localStorage.setItem('admin', JSON.stringify(result.admin))
      setAdmin(result.admin)
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    queryClient.clear()
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
