import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Copy, Loader2, TimerOff } from 'lucide-react'
import { getPix, type PublicPix } from '../../api/public.api'
import { formatCurrency } from '../../utils/formatCurrency'

function useCountdown(until?: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!until) return ''
  const left = Math.max(0, new Date(until).getTime() - now)
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}:${String(s).padStart(2, '0')}`
}

/**
 * QR Code e "copia e cola" de uma cobrança Pix. Consulta a situação a cada
 * poucos segundos e avisa quando o pagamento é confirmado.
 */
export function PixPanel({
  token,
  onPaid,
}: {
  token: string
  onPaid?: () => void
}) {
  const [pix, setPix] = useState<PublicPix | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const countdown = useCountdown(pix?.status === 'PENDING' ? pix.expiresAt : undefined)

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const load = async () => {
      try {
        const data = await getPix(token)
        if (!active) return
        setPix(data)
        setError(false)
        if (data.status === 'PAID') onPaid?.()
        if (data.status === 'PENDING') timer = setTimeout(load, 4000)
      } catch {
        if (!active) return
        setError(true)
        timer = setTimeout(load, 8000)
      }
    }
    void load()
    return () => {
      active = false
      clearTimeout(timer)
    }
    // onPaid é estável o bastante; recarregar só quando o token muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!pix)
    return (
      <div className="grid place-items-center rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
        {error ? (
          <p className="text-sm text-zinc-400">Não foi possível carregar o Pix. Tentando de novo…</p>
        ) : (
          <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        )}
      </div>
    )

  if (pix.status === 'PAID')
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <p className="mt-4 font-display text-xl font-bold text-white">Pagamento confirmado</p>
        <p className="mt-1 text-sm text-zinc-400">
          Recebemos {formatCurrency(pix.amount)}. Obrigado!
        </p>
      </div>
    )

  if (pix.status !== 'PENDING' || !pix.qrCode)
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <TimerOff className="mx-auto h-12 w-12 text-zinc-500" />
        <p className="mt-4 font-display text-lg font-bold text-white">
          {pix.status === 'EXPIRED' ? 'Este Pix expirou' : 'Pix indisponível'}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Fale com {pix.shopName} para receber um novo código.
        </p>
      </div>
    )

  async function copy() {
    try {
      await navigator.clipboard.writeText(pix!.qrCode!)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {pix.kind === 'DEPOSIT' ? 'Sinal do agendamento' : 'Mensalidade'}
          </p>
          <p className="font-display text-2xl font-bold text-white">{formatCurrency(pix.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Expira em</p>
          <p className="tabular font-semibold text-amber-400">{countdown}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        {pix.qrCodeBase64 && (
          <div className="mx-auto w-fit rounded-2xl bg-white p-3">
            <img
              src={`data:image/png;base64,${pix.qrCodeBase64}`}
              alt="QR Code do Pix"
              className="h-52 w-52"
            />
          </div>
        )}
        <p className="text-center text-sm text-zinc-400">
          Abra o app do seu banco, escolha <strong className="text-zinc-200">Pix</strong> e
          escaneie o código ou use o <strong className="text-zinc-200">copia e cola</strong>.
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
          <code className="min-w-0 flex-1 truncate px-2 text-xs text-zinc-400">{pix.qrCode}</code>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Aguardando o pagamento. Esta tela atualiza sozinha.
        </p>
      </div>
    </div>
  )
}
