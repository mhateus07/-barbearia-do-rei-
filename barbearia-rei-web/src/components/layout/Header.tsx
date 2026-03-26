import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { admin, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm px-6 py-3.5 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-100 px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-700">{admin?.name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  )
}
