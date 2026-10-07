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
      <div className="relative aspect-[9/17] overflow-hidden rounded-[1.7rem]">{children}</div>
    </figure>
  )
}

/* ─── Agenda do dia (painel) ─────────────────────────────────────────────── */

const HOUR = 62
const START = 9
const pros = [
  { name: 'Rafael', color: '#3e6aa8' },
  { name: 'Camila', color: '#2a8256' },
  { name: 'Diego', color: '#c0782a' },
]
type Tile = { pro: number; start: number; end: number; client: string; service: string; tone: string }
const tiles: Tile[] = [
  { pro: 0, start: 9, end: 9.75, client: 'Carlos Ribeiro', service: 'Corte + barba', tone: 'border-zinc-200 bg-zinc-100' },
  { pro: 0, start: 10, end: 10.5, client: 'Thiago Costa', service: 'Corte masculino', tone: 'border-yellow-700/30 bg-yellow-100' },
  { pro: 0, start: 11.25, end: 12, client: 'Bruno Martins', service: 'Barba', tone: 'border-emerald-200 bg-emerald-50' },
  { pro: 1, start: 9.5, end: 11, client: 'Mariana Souza', service: 'Coloração', tone: 'border-zinc-200 bg-zinc-100' },
  { pro: 1, start: 11.5, end: 12.25, client: 'Juliana Alves', service: 'Corte e finalização', tone: 'border-amber-200 bg-amber-100' },
  { pro: 2, start: 9, end: 9.5, client: 'Pedro Henrique', service: 'Corte infantil', tone: 'border-zinc-200 bg-zinc-100' },
  { pro: 2, start: 10.25, end: 11, client: 'Lucas Andrade', service: 'Corte + sobrancelha', tone: 'border-emerald-200 bg-emerald-50' },
  { pro: 2, start: 12, end: 12.75, client: 'André Oliveira', service: 'Corte + barba', tone: 'border-amber-200 bg-amber-100' },
]
const hhmm = (h: number) =>
  `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`

export function AgendaMock() {
  const now = 10.7
  return (
    <div className="min-w-[620px] bg-zinc-50 text-left" aria-hidden>
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600">Hoje</span>
          <p className="font-display text-sm font-bold text-zinc-900 sm:text-base">Sexta, 26 de setembro</p>
        </div>
        <div className="hidden rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs sm:flex">
          <span className="rounded-md bg-white px-2.5 py-1 font-semibold text-zinc-900">Dia</span>
          <span className="px-2.5 py-1 text-zinc-500">Semana</span>
        </div>
      </div>
      <div className="grid grid-cols-[3rem_repeat(3,1fr)] border-b border-zinc-200 bg-white">
        <span />
        {pros.map((p, i) => (
          <div key={p.name} className="flex items-center gap-2 border-l border-zinc-100 px-3 py-2">
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
              style={{ background: p.color }}
            >
              {p.name[0]}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-semibold text-zinc-900">{p.name}</span>
              <span className="block text-[10px] text-zinc-500">
                {tiles.filter((t) => t.pro === i).length} atendimentos
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="relative grid grid-cols-[3rem_repeat(3,1fr)] bg-white" style={{ height: HOUR * 4 }}>
        <div className="relative">
          {[9, 10, 11, 12].map((h) => (
            <span
              key={h}
              className="hora absolute right-2 text-[10px] text-zinc-500"
              style={{ top: (h - START) * HOUR + 4 }}
            >
              {hhmm(h)}
            </span>
          ))}
        </div>
        {pros.map((p, i) => (
          <div
            key={p.name}
            className="relative border-l border-zinc-100 [background-image:linear-gradient(var(--color-zinc-100)_1px,transparent_1px)]"
            style={{ backgroundSize: `100% ${HOUR}px` }}
          >
            {tiles
              .filter((t) => t.pro === i)
              .map((t) => (
                <div
                  key={t.client}
                  className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 ${t.tone}`}
                  style={{ top: (t.start - START) * HOUR + 1, height: (t.end - t.start) * HOUR - 2 }}
                >
                  <p className="hora truncate text-[9px] text-zinc-600">
                    {hhmm(t.start)}–{hhmm(t.end)}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-zinc-900">{t.client}</p>
                  {t.end - t.start >= 0.75 && (
                    <p className="truncate text-[10px] text-zinc-500">{t.service}</p>
                  )}
                </div>
              ))}
          </div>
        ))}
        <div
          className="pointer-events-none absolute left-12 right-0 flex items-center"
          style={{ top: (now - START) * HOUR }}
        >
          <span className="-ml-1 h-2 w-2 rounded-full bg-accent" />
          <span className="h-0.5 flex-1 bg-accent" />
        </div>
      </div>
    </div>
  )
}

/* ─── Agendamento pelo celular (cliente) ─────────────────────────────────── */

const slots = ['09:00', '09:45', '10:30', '11:15', '13:30', '14:15', '15:00', '16:30', '17:15']

export function BookingMock() {
  return (
    <div className="on-ink flex h-full flex-col bg-zinc-950 text-left text-espuma" aria-hidden>
      <div className="flex items-center gap-2 border-b border-white/10 bg-navalha px-3 py-3">
        <BrandMark variant="negative" className="h-5 w-5" />
        <span className="font-display text-[11px] font-bold">Barbearia Aurora</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={`h-1 flex-1 rounded-full ${s <= 3 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
        <p className="mt-3 font-display text-[13px] font-bold">Escolha o horário</p>
        <p className="text-[9px] text-zinc-400">Corte + barba com Rafael · 45 min</p>
        <div className="mt-3 flex gap-1.5">
          {['Qui 25', 'Sex 26', 'Sáb 27'].map((d, i) => (
            <span
              key={d}
              className={`flex-1 rounded-lg border py-1.5 text-center text-[9px] font-semibold ${i === 1 ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800'}`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {slots.map((s) => (
            <span
              key={s}
              className={`hora rounded-md py-1.5 text-center text-[9px] ${s === '10:30' ? 'bg-amber-500 font-medium text-zinc-950' : 'border border-zinc-800 bg-zinc-900 text-espuma'}`}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-[9px]">
          <p className="flex justify-between">
            <span className="text-zinc-400">Corte + barba</span>
            <span className="hora">R$ 70,00</span>
          </p>
          <p className="flex justify-between border-t border-white/10 pt-1.5 font-semibold">
            <span>Sexta, 26/09</span>
            <span className="hora">10:30 – 11:15</span>
          </p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <span className="block rounded-lg bg-amber-500 py-2 text-center text-[10px] font-bold text-zinc-950">
          Continuar
        </span>
      </div>
    </div>
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
