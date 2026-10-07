import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/auth-state'
import { BrandLogo, BrandMark } from '../../components/ui/BrandMark'
import { LossCalculator } from './LossCalculator'
import { ScreenVideo } from './ScreenVideo'
import { videos } from './videos'
import {
  BrowserFrame,
  CashMock,
  MiniList,
  PhoneFrame,
  PixMock,
  WhatsAppMock,
} from './mocks'

// Página de apresentação do Seu Barbeiro (raiz do site para quem não está
// logado). Mesma estrutura do site do Pedeli: topo com o produto, passo a
// passo, calculadora, comparação, dúvidas e chamada final.

const WHATSAPP_DISPLAY = '(32) 99857-8057'
const WHATSAPP_URL = `https://wa.me/5532998578057?text=${encodeURIComponent(
  'Olá, quero conhecer o Seu Barbeiro.',
)}`

const HERO_POINTS = [
  'Cliente agenda sozinho pelo seu link',
  'Lembrete automático no WhatsApp',
  'Celular, tablet ou computador',
]

const FLOW: { step: string; title: string; text: string; visual: ReactNode }[] = [
  {
    step: '1',
    title: 'O cliente marca pelo seu link',
    text: 'Escolhe o serviço, o profissional e um horário livre, no celular. Sem baixar aplicativo e sem criar conta. Você manda o link no WhatsApp ou coloca na bio do Instagram.',
    visual: (
      <PhoneFrame className="mx-auto w-[60%] max-w-[250px]">
        <ScreenVideo
          video={videos.agendamento}
          label="Cliente escolhendo serviço, profissional e horário no celular até o horário confirmado"
          className="block h-full w-full object-cover object-top"
        />
      </PhoneFrame>
    ),
  },
  {
    step: '2',
    title: 'O lembrete sai sozinho',
    text: 'Antes do horário, o cliente recebe a mensagem no WhatsApp com um link para confirmar, remarcar ou cancelar. Você escolhe com quantas horas de antecedência.',
    visual: <WhatsAppMock />,
  },
  {
    step: '3',
    title: 'O sinal no Pix segura o horário',
    text: 'Peça sinal para todos os clientes ou só para quem já faltou. O Pix é confirmado na hora e o valor é descontado no dia do atendimento.',
    visual: <PixMock />,
  },
  {
    step: '4',
    title: 'Atendeu, recebeu, fechou o caixa',
    text: 'Cada atendimento vira recebimento por forma de pagamento, com a comissão do profissional calculada. No fim do dia, o caixa fecha conferido, com sangrias e reforços.',
    visual: <CashMock />,
  },
]

const COMPARE = [
  ['Marcar horário', 'Mensagem por mensagem, no meio do corte', 'O cliente escolhe sozinho, a qualquer hora'],
  ['Lembrete', 'Quando dá tempo de lembrar', 'Automático no WhatsApp, com link para remarcar'],
  ['Cliente que falta', 'Horário perdido e cadeira vazia', 'Sinal no Pix e lista de espera para a vaga'],
  ['Fim do dia', 'Conta na calculadora e caderno', 'Caixa fechado por forma de pagamento'],
  ['Comissão da equipe', 'Planilha no fim do mês', 'Calculada em cada atendimento'],
]

const CONTROL: { title: string; text: string; rows: [string, string, string?][] }[] = [
  {
    title: 'Comissão de cada profissional',
    text: 'A porcentagem de cada um entra no atendimento. No fim do mês, o valor de cada profissional está pronto, com vales descontados.',
    rows: [
      ['Rafael', 'R$ 2.840,00', '86 atendimentos · 40%'],
      ['Camila', 'R$ 3.120,00', '64 atendimentos · 40%'],
      ['Diego', 'R$ 1.960,00', '71 atendimentos · 35%'],
    ],
  },
  {
    title: 'Clientes para chamar de volta',
    text: 'Cada serviço tem um prazo de retorno. O painel mostra quem já passou do tempo, para você chamar no WhatsApp antes que vá para outro salão.',
    rows: [
      ['Carlos Ribeiro', '34 dias', 'Corte + barba · retorno em 30 dias'],
      ['Mariana Souza', '29 dias', 'Coloração · retorno em 25 dias'],
      ['Lucas Andrade', '41 dias', 'Corte masculino · retorno em 30 dias'],
    ],
  },
  {
    title: 'Assinaturas e planos',
    text: 'Venda planos mensais, como corte ilimitado ou quatro cortes por mês. O sistema controla o uso de cada cliente e o que vence.',
    rows: [
      ['Plano Corte + Barba', 'R$ 129,90', '38 assinantes ativos'],
      ['Plano Corte', 'R$ 89,90', '52 assinantes ativos'],
      ['Plano Barba', 'R$ 59,90', '17 assinantes ativos'],
    ],
  },
]

const FAQ = [
  [
    'O cliente precisa baixar aplicativo?',
    'Não. A página de agendamento abre no navegador do celular, pelo link do seu salão. Dá para mandar no WhatsApp e colocar na bio do Instagram.',
  ],
  [
    'Serve para salão de beleza também?',
    'Sim. Cada profissional tem a própria agenda, e os serviços podem ter tempo de pausa, como na coloração, para encaixar outro cliente enquanto a tinta age.',
  ],
  [
    'Como funciona o lembrete no WhatsApp?',
    'A mensagem sai sozinha antes do horário, na antecedência que você escolher, com um link para o cliente confirmar, remarcar ou cancelar sem precisar te chamar.',
  ],
  [
    'E quando o cliente cancela?',
    'O horário volta para a agenda. Se você ativar a lista de espera, a vaga é oferecida pelo WhatsApp para quem estava esperando por aquele dia.',
  ],
  [
    'Cada profissional tem acesso próprio?',
    'Tem. O profissional entra e vê só a agenda. Faturamento, caixa e configurações ficam com o dono e a recepção.',
  ],
  [
    'Meus dados ficam separados dos outros salões?',
    'Ficam. Cada salão tem o próprio banco de dados.',
  ],
  [
    'Quanto custa?',
    'Chame a gente no WhatsApp: a gente passa os valores e mostra o sistema funcionando com a agenda do seu salão.',
  ],
]

const btn =
  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold transition-colors'

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function DemoButton({ light, children = 'Agendar demonstração' }: { light?: boolean; children?: ReactNode }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${btn} ${light ? 'bg-white text-navalha hover:bg-espuma' : 'bg-navalha text-white hover:bg-zinc-800'}`}
    >
      {children}
    </a>
  )
}

function WhatsAppButton({ onDark, children = 'Falar no WhatsApp' }: { onDark?: boolean; children?: ReactNode }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${btn} ${onDark ? 'text-white ring-1 ring-inset ring-white/25 hover:bg-white/10' : 'bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50'}`}
    >
      <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
      {children}
    </a>
  )
}

function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-[2.5rem]">{title}</h2>
      {children && <p className="mt-4 text-lg leading-relaxed text-zinc-600">{children}</p>}
    </div>
  )
}

export function HomePage() {
  // Quem já tem sessão aberta vê a apresentação também, com atalho para o painel.
  const { isAuthenticated } = useAuth()
  const panel = isAuthenticated ? { to: '/operacao', label: 'Abrir painel' } : { to: '/login', label: 'Entrar' }
  return (
    <div className="flex min-h-dvh flex-col bg-white text-zinc-900">
      {/* Cabeçalho */}
      <header className="on-ink sticky top-0 z-20 border-b border-white/10 bg-navalha text-white">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-4">
          <Link to="/" aria-label="Seu Barbeiro, página inicial" className="shrink-0">
            <BrandLogo negative />
          </Link>
          <div className="hidden items-center gap-6 text-[15px] text-white/70 md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-white">Como funciona</a>
            <a href="#faltas" className="transition-colors hover:text-white">Faltas</a>
            <a href="#controle" className="transition-colors hover:text-white">Controle</a>
            <a href="#duvidas" className="transition-colors hover:text-white">Dúvidas</a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={panel.to}
              className="rounded-lg px-3 py-2 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {panel.label}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-white px-4 py-2 text-[15px] font-semibold text-navalha transition-colors hover:bg-espuma sm:inline-block"
            >
              Agendar demonstração
            </a>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col overflow-x-clip">
        {/* Topo: texto e o produto grande, invadindo a seção seguinte */}
        <section className="on-ink bg-navalha text-white">
          <div className="mx-auto w-full max-w-6xl px-4 pt-16 lg:pt-24">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end">
              <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
                Gerencie seu salão em um só lugar.
              </h1>
              <div>
                <p className="text-lg leading-relaxed text-white/70">
                  Agenda online, lembrete no WhatsApp, sinal no Pix, comandas, comissões e caixa
                  no mesmo sistema. Para barbearias e salões de beleza.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <DemoButton light />
                  <WhatsAppButton onDark />
                </div>
              </div>
            </div>
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/60">
              {HERO_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-toalha" strokeWidth={2.5} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto mt-14 w-full max-w-6xl px-4">
            <div className="relative sm:pr-[12%]">
              <BrowserFrame url="seubarbeiro.impulsiodigital.com/operacao" className="-mb-24 sm:-mb-40">
                <div className="aspect-[16/9] overflow-hidden bg-zinc-50">
                  <ScreenVideo
                    video={videos.agenda}
                    label="Agenda do dia: um horário livre vira atendimento e a comanda de outro cliente é aberta"
                    priority
                    className="block h-full w-full object-cover"
                  />
                </div>
              </BrowserFrame>
              <PhoneFrame className="absolute -bottom-28 right-4 hidden w-[26%] max-w-[230px] sm:block">
                <ScreenVideo
                  video={videos.agendamento}
                  label="Cliente agendando pelo celular"
                  priority
                  className="block h-full w-full object-cover object-top"
                />
              </PhoneFrame>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="scroll-mt-16 bg-white pt-40 sm:pt-56">
          <div className="mx-auto w-full max-w-6xl px-4 pb-24">
            <SectionHeader title="Do agendamento ao caixa fechado">
              Quatro etapas, um sistema só. Sem anotar horário em caderno nem responder mensagem
              no meio do corte.
            </SectionHeader>
            <div className="mt-16 flex flex-col gap-24">
              {FLOW.map((f, i) => (
                <div
                  key={f.step}
                  className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="max-w-md">
                    <p className="text-sm font-semibold text-sky-600">Etapa {f.step}</p>
                    <h3 className="mt-2 text-2xl font-bold text-zinc-900">{f.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-zinc-600">{f.text}</p>
                  </div>
                  <div>{f.visual}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faltas: comparação e calculadora */}
        <section id="faltas" className="scroll-mt-16 border-y border-zinc-200 bg-zinc-50">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
              <SectionHeader title="Cliente que falta leva o horário e o dinheiro">
                Cada falta sem aviso é uma cadeira parada que ninguém anota. Com lembrete, sinal
                no Pix e lista de espera, o horário volta a render.
              </SectionHeader>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <div className="min-w-[34rem]">
                  <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 text-sm font-semibold">
                    <span className="p-4" />
                    <span className="p-4 text-zinc-500">Caderno e WhatsApp</span>
                    <span className="flex items-center gap-2 p-4 text-navalha">
                      <BrandMark variant="ink" className="h-5 w-5" />
                      Seu Barbeiro
                    </span>
                  </div>
                  {COMPARE.map(([label, old, ours]) => (
                    <div key={label} className="grid grid-cols-3 border-b border-zinc-200 text-sm last:border-0">
                      <span className="p-4 font-medium text-zinc-900">{label}</span>
                      <span className="p-4 text-zinc-500">{old}</span>
                      <span className="p-4 font-medium text-navalha">{ours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-20">
              <h3 className="text-2xl font-bold text-zinc-900">Quanto as faltas custam para o seu salão</h3>
              <p className="mt-2 text-zinc-600">Ajuste com os números do seu dia a dia.</p>
              <div className="mt-6">
                <LossCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* Controle */}
        <section id="controle" className="scroll-mt-16 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <SectionHeader title="Você sabe quanto cada cadeira rendeu no mês?">
              A agenda resolve o dia. O Seu Barbeiro também cuida do que vem depois: comissão da
              equipe, cliente que sumiu e receita que se repete todo mês.
            </SectionHeader>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {CONTROL.map((c) => (
                <article key={c.title} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 bg-zinc-50 p-4">
                    <MiniList rows={c.rows} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-zinc-900">{c.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{c.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Dúvidas */}
        <section id="duvidas" className="scroll-mt-16 border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-24 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeader title="Dúvidas frequentes">
              Não achou o que procurava? Fale com a gente pelo WhatsApp.
            </SectionHeader>
            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900">
                    {q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-zinc-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="on-ink bg-navalha text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                Veja o Seu Barbeiro com a agenda do seu salão.
              </h2>
              <p className="mt-3 text-lg text-white/70">
                A gente mostra o sistema funcionando na sua rotina. Ou salve o número <span className="whitespace-nowrap">{WHATSAPP_DISPLAY}</span>.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <DemoButton light />
              <WhatsAppButton onDark />
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="on-ink bg-zinc-950 text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLogo negative size="lg" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Agenda, clientes, Pix e caixa para barbearias e salões. Da Impulsio Digital, de Juiz
              de Fora (MG).
            </p>
            <div className="mt-6">
              <WhatsAppButton onDark>{WHATSAPP_DISPLAY}</WhatsAppButton>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 font-semibold text-white">Produto</p>
            <a href="#como-funciona" className="text-white/60 hover:text-white">Como funciona</a>
            <a href="#faltas" className="text-white/60 hover:text-white">Calculadora de faltas</a>
            <a href="#duvidas" className="text-white/60 hover:text-white">Dúvidas frequentes</a>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 font-semibold text-white">Já é cliente?</p>
            <Link to={panel.to} className="text-white/60 hover:text-white">{isAuthenticated ? 'Abrir painel' : 'Entrar no painel'}</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              Falar no WhatsApp
            </a>
          </div>
        </div>
        <p className="border-t border-white/10 py-5 text-center text-xs text-white/45">
          © {new Date().getFullYear()} Seu Barbeiro · Produto da Impulsio Digital
        </p>
      </footer>
    </div>
  )
}
