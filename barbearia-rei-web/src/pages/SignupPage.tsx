import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { signup } from '../api/onboarding.api'
import { Scissors, Mail, Lock, User, Store, ArrowRight, Link2 } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[̀-ͯ]', 'g'), '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SignupPage() {
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const [shopName, setShopName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleShopNameChange(value: string) {
    setShopName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signup({ shopName, slug, adminName, adminEmail, adminPassword })
      setSession(result.token, result.admin, result.tenant.slug)
      navigate('/dashboard')
    } catch (err) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
        ?.error?.message
      setError(message || 'Não foi possível criar sua conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-zinc-900 to-zinc-950 border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <Scissors className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg">Gestão de Barbearia</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Coloque sua barbearia
            <br />
            <span className="text-amber-400">no piloto automático.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Agenda, financeiro, fidelidade e agendamento online — tudo pronto em minutos.
          </p>
        </div>
        <div className="flex gap-8">
          {[
            { value: '100%', label: 'Online' },
            { value: '24/7', label: 'Disponível' },
            { value: '∞', label: 'Agendamentos' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30 mb-6 lg:hidden">
              <Scissors className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Crie sua conta</h1>
            <p className="text-zinc-400 text-sm">Comece a usar agora, sem custo pra testar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Nome da barbearia</label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => handleShopNameChange(e.target.value)}
                  placeholder="Minha Barbearia"
                  required
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Endereço da sua página</label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="minha-barbearia"
                  required
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
              {slug && <p className="text-xs text-zinc-500">saas.impulsiodigital.com/{slug}/agendar</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Seu nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 px-4 py-3 text-sm font-semibold text-white transition-colors shadow-lg shadow-amber-500/25 mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Criar conta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-zinc-500 pt-2">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
