import { useState } from 'react'
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Agenda } from './OperationsPage'
import { barberColor, statusDots, statusLabels } from './agendaTheme'

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

export function MiniCalendar({
  date,
  week,
  onPick,
}: {
  date: string
  /** Destaca a semana inteira da data selecionada. */
  week: boolean
  onPick: (date: string) => void
}) {
  const selected = parseISO(date)
  const [month, setMonth] = useState(() => startOfMonth(selected))
  const [shown, setShown] = useState(date)
  // Acompanha a data quando ela muda pelos botões da barra de ferramentas.
  if (shown !== date) {
    setShown(date)
    if (!isSameMonth(month, selected)) setMonth(startOfMonth(selected))
  }
  const first = startOfWeek(month)
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i))
  const weekStart = startOfWeek(selected)
  const today = new Date()

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-bold text-zinc-900 first-letter:uppercase">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <div className="flex">
          <button
            aria-label="Mês anterior"
            onClick={() => setMonth(addMonths(month, -1))}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Próximo mês"
            onClick={() => setMonth(addMonths(month, 1))}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-zinc-400">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((d) => {
          const inWeek = week && d >= weekStart && d < addDays(weekStart, 7)
          const isSelected = isSameDay(d, selected)
          const isToday = isSameDay(d, today)
          return (
            <button
              key={d.toISOString()}
              onClick={() => onPick(iso(d))}
              aria-label={format(d, "d 'de' MMMM", { locale: ptBR })}
              aria-pressed={isSelected}
              className={`tabular mx-auto grid h-8 w-8 place-items-center rounded-full text-xs transition-colors ${
                isSelected
                  ? 'bg-amber-500 font-bold text-white'
                  : inWeek
                    ? 'bg-amber-100 font-semibold text-amber-800'
                    : isToday
                      ? 'font-bold text-amber-600 ring-1 ring-amber-400'
                      : isSameMonth(d, month)
                        ? 'text-zinc-700 hover:bg-zinc-100'
                        : 'text-zinc-300 hover:bg-zinc-100'
              }`}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AgendaSummary({
  agenda,
  barberFilter,
}: {
  agenda: Agenda
  barberFilter?: string
}) {
  const list = agenda.appointments.filter(
    (a) => !barberFilter || a.barber.id === barberFilter,
  )
  const active = list.filter((a) => !['CANCELLED', 'NO_SHOW'].includes(a.status))
  const expected = active.reduce((sum, a) => sum + Number(a.totalPrice), 0)
  const done = active.filter((a) => a.status === 'COMPLETED').length
  const lost = list.length - active.length

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Resumo do período
        </p>
        <p className="tabular mt-2 font-display text-2xl font-bold text-zinc-900">
          {formatCurrency(expected)}
        </p>
        <p className="text-xs text-zinc-500">previsto em atendimentos</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['Agenda', active.length],
            ['Concluídos', done],
            ['Faltas/canc.', lost],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-zinc-50 px-1 py-2">
              <dd className="tabular font-display text-lg font-bold text-zinc-900">
                {value}
              </dd>
              <dt className="text-[10px] text-zinc-500">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Profissionais
        </p>
        <ul className="space-y-2">
          {agenda.barbers.map((b) => {
            const count = active.filter((a) => a.barber.id === b.id).length
            return (
              <li key={b.id} className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: barberColor(agenda, b.id) }}
                />
                <span className="flex-1 truncate text-zinc-700">{b.name}</span>
                <span className="tabular text-xs font-semibold text-zinc-500">
                  {count}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Legenda
        </p>
        <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
          {Object.entries(statusLabels).map(([status, label]) => (
            <li key={status} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-sm ${statusDots[status]}`} />
              {label}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-400" />
            Pausa
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-300" />
            Bloqueio
          </li>
        </ul>
      </div>
    </div>
  )
}
