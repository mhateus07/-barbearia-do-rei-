import { getSalon } from '../api/salon'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-state'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Store } from 'lucide-react'
import { BrandMark } from '../components/ui/BrandMark'

// Prévia ilustrativa da agenda, desenhada com os mesmos elementos do painel.
const preview = [
  { time: '09:00', client: 'Carlos R.', service: 'Corte + barba', pro: 'Diego', status: 'Concluído', tone: 'bg-emerald-500/10 text-emerald-300' },
  { time: '10:30', client: 'Thiago C.', service: 'Corte masculino', pro: 'Rafael', status: 'Em atendimento', tone: 'bg-sky-500/10 text-sky-300' },
  { time: '11:15', client: 'Bruno M.', service: 'Barba', pro: 'Diego', status: 'Confirmado', tone: 'bg-amber-500/10 text-amber-300' },
  { time: '14:00', client: 'Lucas A.', service: 'Corte + sobrancelha', pro: 'Rafael', status: 'Agendado', tone: 'bg-white/5 text-zinc-400' },
]

const modules = ['Agenda', 'Clientes', 'Pix', 'Assinaturas', 'Caixa', 'Comissões']

const field =
  'w-full rounded-lg border border-white/10 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-hidden transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="h-8 w-8" />
      <span className="font-display text-base font-bold tracking-tight">Seu Barbeiro</span>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [salon, setSalon] = useState(getSalon())
  const [editSalon, setEditSalon] = useState(!salon)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      try {
        localStorage.setItem('salon', salon)
      } catch {
        // Sem armazenamento: o salão vale só nesta sessão.
      }
      await login(email, password)
      navigate('/operacao')
    } catch {
      setError('E-mail ou senha inválidos. Confira também o identificador do salão.')
      setAttempt((n) => n + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-zinc-950 font-sans text-white">
      {/* Painel do produto */}
      <aside className="relative hidden w-[55%] flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-zinc-900/40 p-12 lg:flex xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-xl">
          <h2 className="text-balance font-display text-4xl font-bold leading-tight tracking-tight text-zinc-50 xl:text-[2.75rem]">
            Gestão para barbearias e salões
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            Agenda, clientes, cobranças e caixa no mesmo painel, no computador do balcão ou no
            celular.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Agenda de hoje</p>
                <p className="text-xs text-zinc-500">4 atendimentos · 2 profissionais</p>
              </div>
              <div className="flex rounded-md border border-white/10 p-0.5 text-xs">
                <span className="rounded bg-white/10 px-2 py-0.5 font-medium text-zinc-100">Dia</span>
                <span className="px-2 py-0.5 text-zinc-500">Semana</span>
              </div>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {preview.map((row) => (
                <li key={row.time} className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-4 px-5 py-3 text-sm">
                  <span className="tabular font-medium text-zinc-400">{row.time}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-zinc-100">{row.client}</span>
                    <span className="block truncate text-xs text-zinc-500">
                      {row.service} · {row.pro}
                    </span>
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${row.tone}`}>
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
            {modules.map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-600">© {new Date().getFullYear()} Seu Barbeiro</p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        <div className="lg:hidden">
          <Brand />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight">Entrar no painel</h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                Use o e-mail e a senha da sua conta no salão.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editSalon ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-zinc-300">Identificador do salão</span>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      required
                      pattern="[a-z0-9\-]+"
                      title="Use letras minúsculas, números e hífen"
                      autoCapitalize="none"
                      value={salon}
                      onChange={(e) => setSalon(e.target.value.toLowerCase())}
                      placeholder="ex.: seu-barbeiro"
                      className={field}
                    />
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/60 px-3.5 py-2.5 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-zinc-400">
                    <Store className="h-4 w-4 shrink-0" />
                    Salão <strong className="truncate font-semibold text-white">{salon}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditSalon(true)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Trocar
                  </button>
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-300">E-mail</span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@seusalao.com"
                    required
                    className={field}
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-300">Senha</span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className={`${field} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  key={attempt}
                  role="alert"
                  className="animate-pop-in rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          É cliente?{' '}
          <Link
            to={`/agendar?salon=${encodeURIComponent(salon || getSalon())}`}
            className="font-semibold text-amber-400 hover:text-amber-300"
          >
            Agende seu horário
          </Link>
        </p>
      </main>
    </div>
  )
}
