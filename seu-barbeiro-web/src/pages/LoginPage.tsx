import { getSalon } from '../api/salon'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-state'
import {
  Scissors,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CalendarDays,
  QrCode,
  Repeat,
  Wallet,
  BellRing,
  Store,
} from 'lucide-react'

const PHOTO = '/login/fundo.jpg'
const TOWEL = '/login/toalha.jpg'
const DESIGN = '/login/desenho.jpg'

const features = [
  { icon: CalendarDays, title: 'Agenda inteligente', text: 'Dia e semana, arrastar para remarcar' },
  { icon: QrCode, title: 'Sinal via Pix', text: 'O cliente paga ao agendar e falta menos' },
  { icon: Repeat, title: 'Clube de assinatura', text: 'Receita previsível todo mês' },
  { icon: Wallet, title: 'Caixa e comissões', text: 'Vales, sangrias e fechamento do dia' },
]

const field =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-hidden transition-all focus:border-amber-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-amber-500/15'

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
    <div className="relative flex min-h-dvh bg-zinc-950 font-sans text-white">
      {/* Painel da marca */}
      <aside className="relative hidden w-[52%] overflow-hidden lg:block">
        <img
          src={PHOTO}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/30" />
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-zinc-950/90" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-amber-300 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/30">
              <Scissors className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Seu Barbeiro</span>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Gestão completa para barbearias e salões
            </p>
            <h2 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
              Não é só corte,
              <br />
              <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                é cuidado.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-300">
              Agenda, clientes, Pix, assinaturas e caixa num só lugar, do balcão ao celular.
            </p>

            <ul className="mt-9 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                >
                  <Icon className="h-5 w-5 text-amber-400" />
                  <p className="mt-3 text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-zinc-400">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="flex w-80 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 shadow-2xl backdrop-blur-xl">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-zinc-950">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="min-w-0 text-sm leading-tight">
                <p className="font-semibold">Novo agendamento online</p>
                <p className="truncate text-xs text-zinc-400">Corte + barba · hoje 14:00 · sinal pago</p>
              </div>
            </div>
            <div className="flex -space-x-4">
              {[TOWEL, DESIGN].map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-20 w-20 rounded-2xl border-2 border-zinc-950 object-cover shadow-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Formulário */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div className="relative w-full max-w-sm animate-pop-in">
          <div className="mb-9">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-amber-300 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/30">
                <Scissors className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold">Seu Barbeiro</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Entre para ver a agenda de hoje.
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
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Store className="h-4 w-4" />
                  Salão <strong className="font-semibold text-white">{salon}</strong>
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div
                key={attempt}
                role="alert"
                className="animate-pop-in rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
            É cliente?{' '}
            <Link
              to={`/agendar?salon=${encodeURIComponent(salon || getSalon())}`}
              className="font-semibold text-amber-400 hover:text-amber-300"
            >
              Agende seu horário
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
