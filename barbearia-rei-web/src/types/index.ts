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
  commissionRate?: number
  createdAt: string
  updatedAt: string
}

export interface BarberCommission {
  barberId: string
  barberName: string
  commissionRate: number
  totalRevenue: number
  commission: number
  appointmentsCount: number
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

export type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'SUPPLIES' | 'SALARY' | 'EQUIPMENT' | 'MARKETING' | 'OTHER'
export type ExpenseStatus = 'PENDING' | 'PAID' | 'OVERDUE'

export interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
  notes?: string
  appointmentId?: string
  appointment?: {
    id: string
    startsAt: string
    totalPrice: number
    client: { id: string; name: string }
    barber: { id: string; name: string }
    services: { service: { id: string; name: string } }[]
  }
  createdAt: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  dueDate: string
  paidAt?: string
  status: ExpenseStatus
  notes?: string
  createdAt: string
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalPending: number
  totalOverdue: number
  incomeByMethod: Record<string, number>
  expensesByCategory: Record<string, number>
  cashFlowByDay: { date: string; income: number; expenses: number; balance: number }[]
  period: { from: string; to: string }
}
