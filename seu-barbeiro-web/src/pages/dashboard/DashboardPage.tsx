import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { CalendarDays, CheckCircle2, XCircle, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { getDashboardSummary, getDashboardStats } from '../../api/dashboard.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatTime, parseDayKey, todayKey } from '../../utils/formatDate'
import { statusConfig } from '../../utils/appointmentStatus'
import type { AppointmentStatus } from '../../types'

const STATUS_COLORS = [
  'var(--color-amber-500)',
  'var(--color-emerald-500)',
  'var(--color-red-500)',
  'var(--color-zinc-400)',
  'var(--color-sky-400)',
  'var(--color-amber-300)',
]

function StatCard({
  title, value, sub, icon: Icon, accent = false,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${accent ? 'border-navalha bg-navalha text-espuma' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`label-caps truncate ${accent ? 'text-toalha' : 'text-zinc-500'}`}>
            {title}
          </p>
          <p className={`tabular mt-2.5 truncate font-display text-2xl font-extrabold sm:text-[28px] lg:text-[32px] lg:leading-9 ${accent ? 'text-espuma' : 'text-zinc-900'}`}>
            {value}
          </p>
          {sub && <p className={`mt-1 truncate text-xs ${accent ? 'text-toalha/75' : 'text-zinc-500'}`}>{sub}</p>}
        </div>
        <div className={`hidden shrink-0 rounded-xl p-2.5 sm:block ${accent ? 'bg-espuma/10' : 'bg-zinc-100'}`}>
          <Icon className={`h-5 w-5 ${accent ? 'text-toalha' : 'text-zinc-600'}`} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: readonly { value?: string | number }[]; label?: string | number }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-lift">
        <p className="mb-1 text-xs text-zinc-500">{label}</p>
        <p className="hora text-sm font-medium text-zinc-900">{formatCurrency(Number(payload[0].value ?? 0))}</p>
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const today = todayKey()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary', today],
    queryFn: () => getDashboardSummary(today),
    refetchInterval: 60_000,
  })

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const revenueData = stats?.revenueByDay?.slice(-7).map((d) => ({
    name: parseDayKey(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
    value: d.total,
  })) ?? []

  const statusData = stats?.appointmentsByStatus?.map((s) => ({
    name: statusConfig[s.status as AppointmentStatus]?.label ?? s.status,
    value: s.count,
  })) ?? []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-zinc-900">Painel</h1>
        <p className="mt-1 text-sm text-zinc-500 first-letter:uppercase">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Receita do dia" value={formatCurrency(summary?.revenueToday ?? 0)} icon={DollarSign} accent />
        <StatCard title="Agendamentos" value={summary?.totalAppointments ?? 0} sub="hoje" icon={CalendarDays} />
        <StatCard title="Concluídos" value={summary?.completed ?? 0} sub="atendimentos" icon={CheckCircle2} />
        <StatCard title="Cancelados" value={summary?.cancelled ?? 0} sub="hoje" icon={XCircle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">Receita — últimos 7 dias</h2>
          </div>
          {revenueData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
              Nenhum dado ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-zinc-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-zinc-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-zinc-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-zinc-100)' }} />
                <Bar dataKey="value" fill="var(--color-amber-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">Status dos agendamentos</h2>
          </div>
          {statusData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
              Nenhum dado ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Services + Upcoming */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Services */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Serviços mais solicitados</h2>
          {!stats?.topServices?.length ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhum dado ainda</p>
          ) : (
            <div className="space-y-3">
              {stats.topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-700">{s.name}</span>
                      <span className="text-xs text-zinc-400">{s.count}x</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-amber-500"
                        style={{ width: `${(s.count / stats.topServices[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">Próximos agendamentos</h2>
          </div>
          {!summary?.upcomingToday?.length ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhum agendamento pendente hoje.</p>
          ) : (
            <div className="space-y-2.5">
              {summary.upcomingToday.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <div className="text-center min-w-[40px]">
                    <p className="hora text-sm font-medium leading-none text-zinc-900">{formatTime(a.startsAt)}</p>
                    <p className="hora mt-1 text-[11px] text-zinc-500">{formatTime(a.endsAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{a.client.name}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {a.services.map((s) => s.service.name).join(', ')} · {a.barber.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="hora text-xs font-medium text-zinc-700">{formatCurrency(Number(a.totalPrice))}</span>
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
