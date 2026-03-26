import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/barbeiros', label: 'Barbeiros', icon: Scissors },
  { to: '/servicos', label: 'Serviços', icon: Sparkles },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col bg-zinc-950 border-r border-zinc-800/60">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <Scissors className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Barbearia do Rei</p>
            <p className="text-[11px] text-zinc-500 leading-tight">Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
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
      <div className="px-4 py-4 border-t border-zinc-800/60">
        <p className="text-[10px] text-zinc-600 text-center">v1.0.0 · 2026</p>
      </div>
    </aside>
  )
}
