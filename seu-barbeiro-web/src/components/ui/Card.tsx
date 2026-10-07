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
      className={`group relative overflow-hidden rounded-2xl border p-5 ${
        accent ? 'border-navalha bg-navalha text-espuma' : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`label-caps ${accent ? 'text-toalha' : 'text-zinc-500'}`}>{title}</p>
          <p
            className={`tabular mt-2 truncate font-display text-[28px] leading-8 font-extrabold ${accent ? 'text-espuma' : 'text-zinc-900'}`}
          >
            {value}
          </p>
          {subtitle && <p className={`mt-1 text-xs ${accent ? 'text-toalha/70' : 'text-zinc-500'}`}>{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${accent ? 'bg-espuma/10 text-toalha' : 'bg-zinc-100 text-zinc-600'}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
