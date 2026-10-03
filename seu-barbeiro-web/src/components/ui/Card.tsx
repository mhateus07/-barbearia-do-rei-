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
      className={`rounded-xl border p-5 shadow-sm ${
        accent ? 'border-amber-200 bg-amber-50' : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${accent ? 'text-amber-600' : 'text-zinc-800'}`}>
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
        </div>
        {icon && <div className={`text-2xl ${accent ? 'text-amber-500' : 'text-zinc-400'}`}>{icon}</div>}
      </div>
    </div>
  )
}
