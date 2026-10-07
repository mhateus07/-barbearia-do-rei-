import type { ReactNode } from 'react'
import { CheckCheck, CircleCheck, Copy, QrCode } from 'lucide-react'
import { BrandMark } from '../../components/ui/BrandMark'

/*
  Telas ilustrativas da página de apresentação, desenhadas com os mesmos
  elementos do painel (sem fotos nem imagens). Os nomes são fictícios.
*/

export function BrowserFrame({
  url,
  children,
  className = '',
}: {
  url: string
  children: ReactNode
  className?: string
}) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgb(21_35_63/0.35)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-3 py-2" aria-hidden>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <span className="truncate rounded bg-white px-2 py-0.5 text-[11px] text-zinc-500">{url}</span>
      </div>
      {children}
    </figure>
  )
}

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <figure
      className={`rounded-[2.2rem] bg-zinc-950 p-2 shadow-[0_24px_48px_-20px_rgb(14_21_38/0.5)] ${className}`}
    >
      <div className="relative aspect-[9/17] overflow-hidden rounded-[1.7rem] bg-zinc-950">{children}</div>
    </figure>
  )
}

/* ─── Lembrete no WhatsApp ───────────────────────────────────────────────── */

export function WhatsAppMock() {
  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-[#efeae2] text-left" aria-hidden>
      <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-navalha">
          <BrandMark variant="negative" className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">Barbearia Aurora</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="max-w-[88%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-[13px] leading-snug text-zinc-900 shadow-[0_1px_0_rgb(0_0_0/0.08)]">
          Oi, Mariana. Seu horário na Barbearia Aurora está marcado para amanhã, sexta, às 09:30,
          com a Camila (Corte e finalização). Para confirmar, remarcar ou cancelar, use o link:{' '}
          <span className="text-[#027eb5] underline">seubarbeiro.impulsiodigital.com/meu-horario/…</span>
          <span className="hora mt-1 block text-right text-[10px] text-zinc-400">18:00</span>
        </div>
        <div className="ml-auto max-w-[60%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13px] text-zinc-900 shadow-[0_1px_0_rgb(0_0_0/0.08)]">
          Confirmado, obrigada
          <span className="hora mt-1 flex items-center justify-end gap-1 text-[10px] text-zinc-400">
            18:04 <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Sinal no Pix ───────────────────────────────────────────────────────── */

export function PixMock() {
  return (
    <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-5 text-left" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Sinal para confirmar o horário</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-zinc-900">R$ 15,00</p>
          <p className="mt-1 text-xs text-zinc-500">Descontado no dia do atendimento</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          <CircleCheck className="h-3 w-3" /> Pago
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <QrCode className="h-10 w-10 shrink-0 text-zinc-900" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-700">Pix copia e cola</p>
          <p className="hora truncate text-[11px] text-zinc-500">00020126580014br.gov.bcb.pix0136…</p>
        </div>
        <Copy className="h-4 w-4 shrink-0 text-zinc-500" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
        <span className="text-zinc-500">Sexta, 26/09 · 10:30</span>
        <span className="font-medium text-zinc-900">Rafael</span>
      </div>
    </div>
  )
}

/* ─── Caixa do dia ───────────────────────────────────────────────────────── */

export function CashMock() {
  const rows = [
    ['Dinheiro', 'R$ 180,00'],
    ['Pix', 'R$ 645,00'],
    ['Cartão de crédito', 'R$ 310,00'],
    ['Cartão de débito', 'R$ 225,00'],
  ]
  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white text-left" aria-hidden>
      <div className="bg-navalha p-5 text-espuma">
        <p className="label-caps text-toalha">Dinheiro esperado na gaveta</p>
        <p className="mt-2 font-display text-3xl font-extrabold">R$ 330,00</p>
        <p className="mt-1 text-xs text-toalha/70">Aberto às 08:52 · troco de R$ 150,00</p>
      </div>
      <ul className="divide-y divide-zinc-100 px-5 py-2 text-sm">
        {rows.map(([m, v]) => (
          <li key={m} className="flex justify-between py-2.5">
            <span className="text-zinc-600">{m}</span>
            <span className="hora font-medium text-zinc-900">{v}</span>
          </li>
        ))}
        <li className="flex justify-between py-2.5 font-semibold">
          <span className="text-zinc-900">Total do dia</span>
          <span className="hora text-zinc-900">R$ 1.360,00</span>
        </li>
      </ul>
    </div>
  )
}

/* ─── Cartões menores (seção de controle) ────────────────────────────────── */

export function MiniList({ rows }: { rows: [string, string, string?][] }) {
  return (
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white text-sm" aria-hidden>
      {rows.map(([a, b, c]) => (
        <li key={a} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className="min-w-0">
            <span className="block truncate font-medium text-zinc-900">{a}</span>
            {c && <span className="block truncate text-xs text-zinc-500">{c}</span>}
          </span>
          <span className="hora shrink-0 text-[13px] text-zinc-700">{b}</span>
        </li>
      ))}
    </ul>
  )
}
