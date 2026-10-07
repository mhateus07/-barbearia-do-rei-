import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:
    'bg-amber-500 text-white hover:bg-amber-400 disabled:bg-amber-300 disabled:text-zinc-600',
  secondary:
    'border border-zinc-400 bg-white text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 disabled:text-zinc-400',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors active:translate-y-px disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
