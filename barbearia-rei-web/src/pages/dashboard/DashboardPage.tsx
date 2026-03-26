import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../../api/dashboard.api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatTime } from '../../utils/formatDate'

export function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary', today],
    queryFn: () => getDashboardSummary(today),
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Dashboard</h1>
        <p className="text-sm text-zinc-500">Resumo do dia — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card
          title="Agendamentos Hoje"
          value={data?.totalAppointments ?? 0}
          icon="📅"
        />
        <Card
          title="Concluídos"
          value={data?.completed ?? 0}
          icon="✅"
        />
        <Card
          title="Cancelados"
          value={data?.cancelled ?? 0}
          icon="❌"
        />
        <Card
          title="Receita do Dia"
          value={formatCurrency(data?.revenueToday ?? 0)}
          icon="💰"
          accent
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-700">Próximos Agendamentos</h2>
        {!data?.upcomingToday?.length ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-400">
            Nenhum agendamento pendente hoje.
          </p>
        ) : (
          <div className="space-y-2">
            {data.upcomingToday.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">{formatTime(a.startsAt)}</p>
                    <p className="text-xs text-zinc-400">{formatTime(a.endsAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800">{a.client.name}</p>
                    <p className="text-sm text-zinc-500">
                      {a.services.map((s) => s.service.name).join(', ')} · {a.barber.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-zinc-700">{formatCurrency(Number(a.totalPrice))}</span>
                  <Badge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
