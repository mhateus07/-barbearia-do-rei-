import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { BrandingProvider } from '../contexts/BrandingContext'
import { useAuth } from '../contexts/auth-context'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { BarbersPage } from '../pages/barbers/BarbersPage'
import { ServicesPage } from '../pages/services/ServicesPage'
import { ClientsPage } from '../pages/clients/ClientsPage'
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage'
import { FinancesPage } from '../pages/finances/FinancesPage'
import { ShowcasePage } from '../pages/showcase/ShowcasePage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { BookingPage } from '../pages/booking/BookingPage'

function AdminArea() {
  const { tenantSlug } = useAuth()
  // Dentro de <PrivateRoute>, isAuthenticated garante que tenantSlug já
  // está setado (vem junto do token no login/signup).
  return (
    <BrandingProvider slug={tenantSlug!}>
      <AdminLayout />
    </BrandingProvider>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/:tenantSlug/agendar" element={<BookingPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AdminArea />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/barbeiros" element={<BarbersPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/agendamentos" element={<AppointmentsPage />} />
            <Route path="/financeiro" element={<FinancesPage />} />
            <Route path="/vitrine" element={<ShowcasePage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
