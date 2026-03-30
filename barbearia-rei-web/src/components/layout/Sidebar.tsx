import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Sparkles,
  Wallet,
  ImageIcon,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/barbeiros', label: 'Barbeiros', icon: Scissors },
  { to: '/servicos', label: 'Serviços', icon: Sparkles },
  { to: '/vitrine', label: 'Vitrine', icon: ImageIcon },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-zinc-950 border-r border-zinc-800/60
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Barbearia do Rei"
            className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-amber-500/20"
          />
          <div className="flex-1">
            <p className="font-bold text-white text-sm leading-tight">Barbearia do Rei</p>
            <p className="text-[11px] text-zinc-500 leading-tight">Painel Administrativo</p>
          </div>
          {/* Botão fechar no mobile */}
          <button
            onClick={onClose}
            className="md:hidden rounded-lg p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800/60 space-y-1">
        <p className="text-[10px] text-zinc-600 leading-snug">São João del Rei · MG</p>
        <p className="text-[10px] text-zinc-600">(32) 99160-8852</p>
        <p className="text-[10px] text-zinc-700">⭐ 5.0 · 32 avaliações</p>
      </div>
    </aside>
  )
}
