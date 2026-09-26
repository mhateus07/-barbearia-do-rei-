import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/auth-state'

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
