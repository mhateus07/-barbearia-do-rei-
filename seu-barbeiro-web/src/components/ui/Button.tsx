import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300',
  secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 disabled:bg-zinc-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
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
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
