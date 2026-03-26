import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
            error ? 'border-red-500' : 'border-zinc-300'
          } ${className}`}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
