import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { BarbersPage } from '../pages/barbers/BarbersPage'
import { ServicesPage } from '../pages/services/ServicesPage'
import { ClientsPage } from '../pages/clients/ClientsPage'
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage'
import { FinancesPage } from '../pages/finances/FinancesPage'
import { ShowcasePage } from '../pages/showcase/ShowcasePage'
import { SettingsPage } from '../pages/settings/SettingsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
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
