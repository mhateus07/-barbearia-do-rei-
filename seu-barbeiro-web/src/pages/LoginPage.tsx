import { getSalon } from '../api/salon'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-state'
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Store,
  CheckCheck,
  Scissors,
  CircleCheck,
  QrCode,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { BrandLogo } from '../components/ui/BrandMark'

/*
  Prévia ilustrativa da agenda, desenhada com os mesmos elementos do painel.
  Os horários são montados em volta da hora atual, então a linha vermelha do
  "agora" sempre cai no lugar certo.
*/
type Tone = 'success' | 'warning' | 'brand'
const preview: {
  start: number
  length: number
  client: string
  service: string
  pro: 0 | 1
  status: string
  tone: Tone
  icon: LucideIcon
}[] = [
  { start: -90, length: 45, client: 'Carlos R.', service: 'Corte + barba', pro: 0, status: 'Pago', tone: 'success', icon: CheckCheck },
  { start: -30, length: 45, client: 'Thiago C.', service: 'Corte masculino', pro: 1, status: 'Em atendimento', tone: 'brand', icon: Scissors },
  { start: 15, length: 30, client: 'Bruno M.', service: 'Barba', pro: 0, status: 'Confirmado', tone: 'success', icon: CircleCheck },
  { start: 60, length: 45, client: 'Lucas A.', service: 'Corte + sobrancelha', pro: 1, status: 'Aguardando Pix', tone: 'warning', icon: QrCode },
]
const pros = [
  { name: 'Diego', dot: 'bg-toalha' },
  { name: 'Rafael', dot: 'bg-[#7FD4A4]' },
]
const tones: Record<Tone, string> = {
  success: 'bg-[#163325] text-[#7FD4A4]',
  warning: 'bg-[#33260C] text-[#F2BE5C]',
  brand: 'bg-[#1E2D4D] text-toalha',
}

const hhmm = (d: Date) =>
  d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function AgendaPreview() {
  const now = useNow()
  const base = new Date(now)
  base.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0)
  const at = (offset: number) => new Date(base.getTime() + offset * 60_000)
  const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
        <div>
          <p className="font-display text-[15px] font-bold text-espuma">Agenda de hoje</p>
          <p className="text-xs text-zinc-500 first-letter:uppercase">{today}</p>
        </div>
        <div className="flex gap-1.5">
          {pros.map((p) => (
            <span
              key={p.name}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-toalha"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <ul className="relative px-2 py-2">
        {preview.map((row, i) => {
          const Icon = row.icon
          return (
            <li key={row.client}>
              {i === 2 && (
                <div className="relative my-1.5 flex items-center gap-2 px-3" aria-label={`Agora, ${hhmm(now)}`}>
                  <span className="hora rounded-md bg-[#FF8466] px-1.5 py-0.5 text-[11px] font-medium text-[#1A0C07]">
                    {hhmm(now)}
                  </span>
                  <span className="h-px flex-1 bg-[#FF8466]" />
                  <span className="h-2 w-2 rounded-full bg-[#FF8466]" />
                </div>
              )}
              <div
                className="grid grid-cols-[4.75rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 text-sm"
              >
                <span className="hora text-[13px] leading-tight text-zinc-400">
                  {hhmm(at(row.start))}
                  <span className="block text-[11px] text-zinc-600">{hhmm(at(row.start + row.length))}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-espuma">{row.client}</span>
                  <span className="flex items-center gap-1.5 truncate text-xs text-zinc-500">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${pros[row.pro].dot}`} />
                    {row.service} · {pros[row.pro].name}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${tones[row.tone]}`}
                >
                  <Icon className="h-3 w-3" strokeWidth={2.25} />
                  {row.status}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const field =
  'w-full rounded-xl border border-zinc-400 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-hidden transition-colors hover:border-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'

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
      setError('E-mail ou senha não conferem. Confira também o identificador do salão.')
      setAttempt((n) => n + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-zinc-50 font-sans text-zinc-900">
      {/* Painel da marca */}
      <aside className="on-ink hidden w-[56%] flex-col justify-between gap-10 bg-navalha px-12 py-10 lg:flex xl:px-16 xl:py-12">
        <Link to="/" aria-label="Seu Barbeiro, apresentação" className="self-start">
          <BrandLogo negative size="lg" />
        </Link>

        <div className="max-w-[34rem]">
          <h2 className="text-balance text-[36px] font-bold leading-[42px] text-espuma">
            Gestão para barbearias e salões
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-toalha/80">
            Agenda, clientes, Pix e caixa no mesmo painel, no computador do balcão ou no celular.
          </p>
          <div className="mt-10">
            <AgendaPreview />
          </div>
        </div>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span>Cada salão tem o próprio banco de dados.</span>
          <span>© {new Date().getFullYear()} Seu Barbeiro</span>
        </p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-1 flex-col">
        <div className="on-ink bg-navalha px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 lg:hidden">
          <Link to="/" aria-label="Seu Barbeiro, apresentação">
            <BrandLogo negative />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-[28px] leading-8 text-zinc-900">Entrar no painel</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Use o e-mail e a senha da sua conta no salão.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editSalon ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-zinc-700">Identificador do salão</span>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-zinc-500">
                    <Store className="h-4 w-4 shrink-0" />
                    Salão <strong className="truncate font-semibold text-zinc-900">{salon}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditSalon(true)}
                    className="text-xs font-semibold text-zinc-900 underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-900"
                  >
                    Trocar
                  </button>
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-zinc-700">E-mail</span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                <span className="text-sm font-semibold text-zinc-700">Senha</span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition-colors hover:text-zinc-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  key={attempt}
                  role="alert"
                  className="flex animate-pop-in gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navalha px-4 text-[15px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-70"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-zinc-500">
          É cliente?{' '}
          <Link
            to={`/agendar?salon=${encodeURIComponent(salon || getSalon())}`}
            className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            Agende seu horário
          </Link>
        </p>
      </main>
    </div>
  )
}
