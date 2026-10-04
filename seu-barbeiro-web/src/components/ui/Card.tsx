import type { ReactNode } from 'react'

interface CardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  accent?: boolean
}

export function Card({ title, value, subtitle, icon, accent }: CardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-soft transition-shadow hover:shadow-lift ${
        accent ? 'border-amber-200 bg-amber-50' : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p
            className={`tabular mt-1.5 truncate font-display text-2xl font-bold tracking-tight ${accent ? 'text-amber-700' : 'text-zinc-900'}`}
          >
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${accent ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
