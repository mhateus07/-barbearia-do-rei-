import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/axios'
import { bookingLink } from '../../api/salon'
import { useAuth } from '../../contexts/auth-state'
import { useState } from 'react'
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
  Link2,
  Check,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { to: '/operacao', label: 'Agenda e operação', icon: CalendarDays },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/barbeiros', label: 'Profissionais', icon: Scissors },
  { to: '/servicos', label: 'Serviços', icon: Sparkles },
  { to: '/vitrine', label: 'Vitrine', icon: ImageIcon },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { admin } = useAuth()
  const BOOKING_URL = bookingLink()
  const { data: identity } = useQuery({
    queryKey: ['identity'],
    queryFn: async () => (await api.get('/operations/identity')).data,
  })
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(BOOKING_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          {identity?.logo ? (
            <img
              src={identity.logo}
              alt="Logo do salão"
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center">
              <Scissors className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-white text-sm leading-tight">
              {identity?.name || 'Meu salão'}
            </p>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Painel Administrativo
            </p>
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
        {navItems
          .filter((item) =>
            admin?.role === 'PROFESSIONAL'
              ? item.to === '/operacao'
              : item.to !== '/configuracoes' || admin?.role === 'OWNER',
          )
          .map((item) => {
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

      {/* Agendamento Online */}
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[11px] font-semibold text-amber-400 mb-2 uppercase tracking-wide">
            Agendamento Online
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 py-1.5 text-xs font-medium transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-2.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800/60 space-y-1">
        <p className="text-[10px] text-zinc-600 leading-snug">
          {identity?.address}
        </p>
        <p className="text-[10px] text-zinc-600">{identity?.phone}</p>
        <p className="text-[10px] text-zinc-700"></p>
      </div>
    </aside>
  )
}
