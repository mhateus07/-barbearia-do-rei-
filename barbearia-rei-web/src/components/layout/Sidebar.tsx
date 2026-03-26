import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/agendamentos', label: 'Agendamentos', icon: '📅' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/barbeiros', label: 'Barbeiros', icon: '✂️' },
  { to: '/servicos', label: 'Serviços', icon: '💈' },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-5">
        <span className="text-2xl">💈</span>
        <div>
          <p className="font-bold text-white">Barbearia do Rei</p>
          <p className="text-xs text-zinc-400">Painel Administrativo</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
