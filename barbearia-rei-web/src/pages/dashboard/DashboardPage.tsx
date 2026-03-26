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
import { formatTime } from '../../utils/formatDate'

const STATUS_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6b7280', '#3b82f6', '#8b5cf6']

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
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-amber-500 border-amber-400' : 'bg-white border-zinc-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${accent ? 'text-amber-100' : 'text-zinc-500'}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${accent ? 'text-white' : 'text-zinc-800'}`}>
            {value}
          </p>
          {sub && <p className={`mt-1 text-xs ${accent ? 'text-amber-200' : 'text-zinc-400'}`}>{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${accent ? 'bg-amber-400/40' : 'bg-zinc-100'}`}>
          <Icon className={`h-5 w-5 ${accent ? 'text-white' : 'text-zinc-500'}`} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-amber-400">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]

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

  const revenueData = stats?.revenueByDay?.slice(-7).map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
    value: d.total,
  })) ?? []

  const statusData = stats?.appointmentsByStatus?.map((s: any) => ({
    name: s.status,
    value: s.count,
  })) ?? []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Receita do Dia" value={formatCurrency(summary?.revenueToday ?? 0)} icon={DollarSign} accent />
        <StatCard title="Agendamentos" value={summary?.totalAppointments ?? 0} sub="hoje" icon={CalendarDays} />
        <StatCard title="Concluídos" value={summary?.completed ?? 0} sub="atendimentos" icon={CheckCircle2} />
        <StatCard title="Cancelados" value={summary?.cancelled ?? 0} sub="hoje" icon={XCircle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Receita — últimos 7 dias</h2>
          </div>
          {revenueData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
              Nenhum dado ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Status dos agendamentos</h2>
          </div>
          {statusData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
              Nenhum dado ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((_: any, index: number) => (
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
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Serviços mais solicitados</h2>
          {!stats?.topServices?.length ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhum dado ainda</p>
          ) : (
            <div className="space-y-3">
              {stats.topServices.map((s: any, i: number) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-700">{s.name}</span>
                      <span className="text-xs text-zinc-400">{s.count}x</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-amber-400"
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
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Próximos agendamentos</h2>
          </div>
          {!summary?.upcomingToday?.length ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhum agendamento pendente hoje.</p>
          ) : (
            <div className="space-y-2.5">
              {summary.upcomingToday.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <div className="text-center min-w-[40px]">
                    <p className="text-base font-bold text-amber-500 leading-none">{formatTime(a.startsAt)}</p>
                    <p className="text-[10px] text-zinc-400">{formatTime(a.endsAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{a.client.name}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {a.services.map((s) => s.service.name).join(', ')} · {a.barber.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-zinc-700">{formatCurrency(Number(a.totalPrice))}</span>
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
