import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const { admin, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600">
          Olá, <strong>{admin?.name}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
