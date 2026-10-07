import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-zinc-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-hidden transition-all placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 ${
            error ? 'border-red-500' : 'border-zinc-400'
          } ${className}`}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
