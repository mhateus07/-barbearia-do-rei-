export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface Admin {
  id: string
  name: string
  email: string
}

export interface Barber {
  id: string
  name: string
  phone?: string
  email?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  durationMin: number
  isActive: boolean
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  notes?: string
  createdAt: string
}

export interface AppointmentService {
  id: string
  priceSnapshot: number
  durationSnapshot: number
  service: { id: string; name: string }
}

export interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  notes?: string
  totalPrice: number
  client: { id: string; name: string; phone: string }
  barber: { id: string; name: string }
  services: AppointmentService[]
  createdAt: string
}

export interface DashboardSummary {
  totalAppointments: number
  completed: number
  cancelled: number
  noShow: number
  revenueToday: number
  upcomingToday: Appointment[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
