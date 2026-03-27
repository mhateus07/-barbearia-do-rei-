import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, Trash2,
  CheckCircle2, Clock, ChevronDown, DollarSign, Scissors, FileDown,
} from 'lucide-react'
import {
  getFinancialSummary,
  listPayments,
  createPayment,
  deletePayment,
  listExpenses,
  createExpense,
  payExpense,
  deleteExpense,
  getCommissions,
} from '../../api/finances.api'
import type { PaymentMethod, ExpenseCategory } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatCurrency'

// ─── LABELS ──────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  CASH: '#10b981',
  PIX: '#3b82f6',
  CREDIT_CARD: '#8b5cf6',
  DEBIT_CARD: '#f59e0b',
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Aluguel',
  UTILITIES: 'Água/Luz/Internet',
  SUPPLIES: 'Materiais/Produtos',
  SALARY: 'Salários/Comissões',
  EQUIPMENT: 'Equipamentos',
  MARKETING: 'Marketing',
  OTHER: 'Outros',
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-700' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function getFirstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, variant = 'default',
}: {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  variant?: 'default' | 'income' | 'expense' | 'warning'
}) {
  const variants = {
    default: 'bg-white border-zinc-200',
    income: 'bg-emerald-500 border-emerald-400',
    expense: 'bg-red-500 border-red-400',
    warning: 'bg-amber-500 border-amber-400',
  }
  const textVariants = {
    default: { title: 'text-zinc-500', value: 'text-zinc-800', sub: 'text-zinc-400', icon: 'bg-zinc-100 text-zinc-500' },
    income: { title: 'text-emerald-100', value: 'text-white', sub: 'text-emerald-200', icon: 'bg-emerald-400/40 text-white' },
    expense: { title: 'text-red-100', value: 'text-white', sub: 'text-red-200', icon: 'bg-red-400/40 text-white' },
    warning: { title: 'text-amber-100', value: 'text-white', sub: 'text-amber-200', icon: 'bg-amber-400/40 text-white' },
  }
  const t = textVariants[variant]
  return (
    <div className={`rounded-2xl border p-5 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${t.title}`}>{title}</p>
          <p className={`mt-2 text-2xl font-bold ${t.value}`}>{value}</p>
          {sub && <p className={`mt-1 text-xs ${t.sub}`}>{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

const CashFlowTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 shadow-xl text-xs space-y-1">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name === 'income' ? 'Receita' : p.name === 'expenses' ? 'Despesas' : 'Saldo'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ─── TAB: RESUMO ─────────────────────────────────────────────────────────────

function SummaryTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finances-summary', from, to],
    queryFn: () => getFinancialSummary(from, to),
  })

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  }

  const cashFlowData = (data?.cashFlowByDay ?? []).map((d) => ({
    name: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    income: d.income,
    expenses: d.expenses,
    balance: d.balance,
  }))

  const methodData = Object.entries(data?.incomeByMethod ?? {}).map(([method, value]) => ({
    name: METHOD_LABELS[method as PaymentMethod] ?? method,
    value,
    color: METHOD_COLORS[method as PaymentMethod] ?? '#6b7280',
  }))

  const categoryData = Object.entries(data?.expensesByCategory ?? {}).map(([cat, value]) => ({
    name: CATEGORY_LABELS[cat as ExpenseCategory] ?? cat,
    value,
  }))

  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Receita do Período" value={formatCurrency(data?.totalIncome ?? 0)} sub="pagamentos recebidos" icon={TrendingUp} variant="income" />
        <StatCard title="Despesas Pagas" value={formatCurrency(data?.totalExpenses ?? 0)} sub="no período" icon={TrendingDown} variant="expense" />
        <StatCard title="Saldo" value={formatCurrency(data?.balance ?? 0)} sub="receita − despesas" icon={Wallet} variant={(data?.balance ?? 0) >= 0 ? 'default' : 'expense'} />
        <StatCard title="Contas Pendentes" value={formatCurrency(data?.totalPending ?? 0)} sub={`${formatCurrency(data?.totalOverdue ?? 0)} vencido`} icon={AlertCircle} variant="warning" />
      </div>

      {/* Cash Flow Chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-zinc-700">Fluxo de Caixa</h2>
        </div>
        {cashFlowData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-zinc-400">Nenhum lançamento no período</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip content={<CashFlowTooltip />} />
              <Area type="monotone" dataKey="income" name="income" stroke="#10b981" fill="url(#gradIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="expenses" stroke="#ef4444" fill="url(#gradExpenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Method + Category */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Receita por Forma de Pagamento</h2>
          {methodData.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhum pagamento no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {methodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Despesas por Categoria</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">Nenhuma despesa no período</p>
          ) : (
            <div className="space-y-2.5">
              {categoryData.sort((a, b) => b.value - a.value).map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-700">{cat.name}</span>
                      <span className="text-xs font-semibold text-zinc-500">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-red-400"
                        style={{ width: `${(cat.value / Math.max(...categoryData.map((c) => c.value))) * 100}%` }}
                      />
                    </div>
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

// ─── TAB: PAGAMENTOS ─────────────────────────────────────────────────────────

function PaymentsTab() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [filterMethod, setFilterMethod] = useState('')
  const [filterFrom, setFilterFrom] = useState(getFirstDayOfMonth())
  const [filterTo, setFilterTo] = useState(today())

  const [form, setForm] = useState({
    amount: '',
    method: 'PIX' as PaymentMethod,
    paidAt: today(),
    notes: '',
    appointmentId: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['finances-payments', filterFrom, filterTo, filterMethod],
    queryFn: () => listPayments({ from: filterFrom, to: filterTo, method: filterMethod || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finances-payments'] })
      qc.invalidateQueries({ queryKey: ['finances-summary'] })
      setShowModal(false)
      setForm({ amount: '', method: 'PIX', paidAt: today(), notes: '', appointmentId: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finances-payments'] })
      qc.invalidateQueries({ queryKey: ['finances-summary'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate({
      amount: Number(form.amount),
      method: form.method,
      paidAt: form.paidAt,
      notes: form.notes || undefined,
      appointmentId: form.appointmentId || undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters + Add */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">De</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Até</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Forma</label>
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-200 px-3 py-2 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todas</option>
              {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Registrar Pagamento
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Spinner size="lg" /></div>
      ) : (data?.data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-400">
          Nenhum pagamento encontrado no período.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Forma</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data!.data.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(p.paidAt)}</td>
                  <td className="px-4 py-3 text-zinc-800">
                    {p.appointment
                      ? `Agendamento — ${p.appointment.client.name}`
                      : p.notes || 'Pagamento avulso'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${METHOD_COLORS[p.method]}20`,
                        color: METHOD_COLORS[p.method],
                      }}
                    >
                      {METHOD_LABELS[p.method]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(Number(p.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm('Remover este pagamento?')) deleteMutation.mutate(p.id)
                      }}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Pagamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">Forma de Pagamento</label>
              <div className="relative">
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
                  className="w-full appearance-none rounded-lg border border-zinc-200 px-3 py-2 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                    <option key={m} value={m}>{METHOD_LABELS[m]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Data do Pagamento</label>
            <input
              type="date"
              value={form.paidAt}
              onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">ID do Agendamento (opcional)</label>
            <Input
              placeholder="UUID do agendamento"
              value={form.appointmentId}
              onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Observações</label>
            <Input
              placeholder="Ex: Serviço avulso, gorjeta..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-red-500">{(createMutation.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── TAB: CONTAS A PAGAR ─────────────────────────────────────────────────────

function ExpensesTab() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'OTHER' as ExpenseCategory,
    dueDate: today(),
    notes: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['finances-expenses', filterStatus, filterCategory],
    queryFn: () => listExpenses({ status: filterStatus || undefined, category: filterCategory || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finances-expenses'] })
      qc.invalidateQueries({ queryKey: ['finances-summary'] })
      setShowModal(false)
      setForm({ description: '', amount: '', category: 'OTHER', dueDate: today(), notes: '' })
    },
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => payExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finances-expenses'] })
      qc.invalidateQueries({ queryKey: ['finances-summary'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finances-expenses'] })
      qc.invalidateQueries({ queryKey: ['finances-summary'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate({
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      dueDate: form.dueDate,
      notes: form.notes || undefined,
    })
  }

  const totalPending = (data?.data ?? [])
    .filter((e) => e.status !== 'PAID')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-4">
      {/* Filters + Add */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Status</label>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-200 px-3 py-2 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Categoria</label>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-200 px-3 py-2 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todas</option>
              {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">
              {formatCurrency(totalPending)} em aberto
            </span>
          </div>
        )}
        <div className="ml-auto">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Spinner size="lg" /></div>
      ) : (data?.data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-400">
          Nenhuma conta encontrada.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data!.data.map((expense) => {
                const isOverdue = expense.status !== 'PAID' && new Date(expense.dueDate) < new Date()
                const statusKey = isOverdue && expense.status === 'PENDING' ? 'OVERDUE' : expense.status
                const statusCfg = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
                return (
                  <tr key={expense.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800">{expense.description}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{CATEGORY_LABELS[expense.category]}</td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(expense.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatCurrency(Number(expense.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {expense.status !== 'PAID' && (
                          <button
                            onClick={() => payMutation.mutate(expense.id)}
                            disabled={payMutation.isPending}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                            title="Marcar como pago"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Remover esta conta?')) deleteMutation.mutate(expense.id)
                          }}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Conta a Pagar">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Descrição</label>
            <Input
              required
              placeholder="Ex: Aluguel do salão, produtos..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">Categoria</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                  className="w-full appearance-none rounded-lg border border-zinc-200 px-3 py-2 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Data de Vencimento</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Observações</label>
            <Input
              placeholder="Opcional"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-red-500">{(createMutation.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── TAB: COMISSÕES ───────────────────────────────────────────────────────────

function CommissionsTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finances-commissions', from, to],
    queryFn: () => getCommissions(from, to),
  })

  const totalCommissions = (data ?? []).reduce((sum, b) => sum + b.commission, 0)
  const totalRevenue = (data ?? []).reduce((sum, b) => sum + b.totalRevenue, 0)

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Receita Total (Concluídos)" value={formatCurrency(totalRevenue)} icon={TrendingUp} variant="income" />
        <StatCard title="Total de Comissões" value={formatCurrency(totalCommissions)} icon={Scissors} variant="warning" />
      </div>

      {(data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-400">
          Nenhum barbeiro cadastrado ou sem atendimentos no período.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Barbeiro</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Atendimentos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Receita Gerada</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Taxa</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data!.map((b) => (
                <tr key={b.barberId} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-xs">
                        {b.barberName.charAt(0)}
                      </div>
                      <span className="font-medium text-zinc-800">{b.barberName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-600">{b.appointmentsCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatCurrency(b.totalRevenue)}</td>
                  <td className="px-4 py-3 text-center">
                    {b.commissionRate > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                        {b.commissionRate}%
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">Não definida</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-zinc-800">{formatCurrency(b.commission)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-200 bg-zinc-50">
                <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-zinc-700">Total</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(totalRevenue)}</td>
                <td />
                <td className="px-4 py-3 text-right font-bold text-zinc-800">{formatCurrency(totalCommissions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-400 text-center">
        Configure a taxa de comissão de cada barbeiro na tela de Barbeiros (botão Editar).
      </p>
    </div>
  )
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

async function exportPDF(from: string, to: string) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const [summary, commissions] = await Promise.all([
    getFinancialSummary(from, to),
    getCommissions(from, to),
  ])

  const doc = new jsPDF()
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-BR')

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Barbearia do Rei', 14, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Relatório Financeiro — ${fmtDate(from)} a ${fmtDate(to)}`, 14, 26)
  doc.setTextColor(0)

  // Summary cards
  doc.setFontSize(10)
  const cards = [
    ['Receita Total', fmt(summary.totalIncome)],
    ['Despesas Pagas', fmt(summary.totalExpenses)],
    ['Saldo', fmt(summary.balance)],
    ['Contas Pendentes', fmt(summary.totalPending)],
  ]
  let x = 14
  cards.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120)
    doc.text(label, x, 36)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(value, x, 42)
    x += 48
  })

  // Cash flow table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Fluxo de Caixa por Dia', 14, 54)
  autoTable(doc, {
    startY: 57,
    head: [['Data', 'Receita', 'Despesas', 'Saldo']],
    body: summary.cashFlowByDay.map((d) => [
      new Date(d.date).toLocaleDateString('pt-BR'),
      fmt(d.income),
      fmt(d.expenses),
      fmt(d.balance),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 158, 11] },
  })

  // Commissions table
  const afterCashFlow = (doc as any).lastAutoTable?.finalY ?? 120
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Comissões dos Barbeiros', 14, afterCashFlow + 10)
  autoTable(doc, {
    startY: afterCashFlow + 13,
    head: [['Barbeiro', 'Atendimentos', 'Receita', 'Taxa', 'Comissão']],
    body: commissions.map((b) => [
      b.barberName,
      String(b.appointmentsCount),
      fmt(b.totalRevenue),
      b.commissionRate > 0 ? `${b.commissionRate}%` : '—',
      fmt(b.commission),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 158, 11] },
  })

  doc.save(`financeiro-${from}-${to}.pdf`)
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

type Tab = 'summary' | 'payments' | 'expenses' | 'commissions'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: 'Resumo', icon: TrendingUp },
  { id: 'payments', label: 'Pagamentos', icon: DollarSign },
  { id: 'expenses', label: 'Contas a Pagar', icon: Clock },
  { id: 'commissions', label: 'Comissões', icon: Scissors },
]

export function FinancesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [from, setFrom] = useState(getFirstDayOfMonth())
  const [to, setTo] = useState(today())
  const [exporting, setExporting] = useState(false)

  async function handleExportPDF() {
    setExporting(true)
    try {
      await exportPDF(from, to)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Financeiro</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {(activeTab === 'summary' || activeTab === 'commissions') && (
            <>
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wide">De</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Até</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </>
          )}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:opacity-50"
          >
            <FileDown className="h-4 w-4 text-zinc-500" />
            {exporting ? 'Gerando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : ''}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'summary' && <SummaryTab from={from} to={to} />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'expenses' && <ExpensesTab />}
      {activeTab === 'commissions' && <CommissionsTab from={from} to={to} />}
    </div>
  )
}
