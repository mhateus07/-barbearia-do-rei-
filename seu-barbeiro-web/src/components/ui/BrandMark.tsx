/*
  Símbolo do Seu Barbeiro (identidade-visual/): relógio cujos ponteiros são uma
  tesoura aberta em 10h10. O pino central é o único ponto vermelho.
  - `tile`: ícone do app, mostrador claro sobre o Azul Navalha;
  - `ink`: só o símbolo, em Azul Navalha, para fundos claros;
  - `negative`: só o símbolo, em Espuma, para fundos em Azul Navalha.
*/
const BLADE =
  'M32 10 L29.4 32 L29.4 33.2 L31 33.2 L31 41.2 L33 41.2 L33 33.2 L35 33.2 C35.4 24.5 34.4 16.5 32 10 Z'

function Dial({ ink }: { ink: string }) {
  return (
    <>
      <circle cx="32" cy="32" r="27" fill="none" stroke={ink} strokeWidth="4.5" />
      <rect x="30.4" y="9.5" width="3.2" height="6" rx="1.2" fill={ink} />
      <rect x="30.4" y="9.5" width="3.2" height="6" rx="1.2" fill={ink} transform="rotate(180 32 32)" />
      <g transform="rotate(60 32 32)">
        <path d={BLADE} fill={ink} />
        <circle cx="32" cy="45.2" r="4" fill="none" stroke={ink} strokeWidth="2.6" />
      </g>
      <g transform="rotate(-60 32 32) translate(64 0) scale(-1 1)">
        <path d={BLADE} fill={ink} />
        <circle cx="32" cy="45.2" r="4" fill="none" stroke={ink} strokeWidth="2.6" />
      </g>
      <circle cx="32" cy="32" r="4.2" fill="#D8462A" />
    </>
  )
}

export function BrandMark({
  className = 'h-10 w-10',
  variant = 'tile',
}: {
  className?: string
  variant?: 'tile' | 'ink' | 'negative'
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 ${className}`}>
      {variant === 'tile' ? (
        <>
          <rect width="64" height="64" rx="14" fill="#15233F" />
          <g transform="translate(7.04 7.04) scale(0.78)">
            <Dial ink="#F5F4F0" />
          </g>
        </>
      ) : (
        <Dial ink={variant === 'ink' ? '#15233F' : '#F5F4F0'} />
      )}
    </svg>
  )
}

const logoSizes = {
  sm: { mark: 'h-6 w-6', text: 'text-[15px]', gap: 'gap-2' },
  md: { mark: 'h-7 w-7', text: 'text-[17px]', gap: 'gap-2.5' },
  lg: { mark: 'h-8 w-8', text: 'text-[19px]', gap: 'gap-2.5' },
}

/** Logo horizontal: símbolo e o nome "Seu Barbeiro". `negative` para fundos em Azul Navalha. */
export function BrandLogo({
  size = 'md',
  negative,
  className = '',
}: {
  size?: keyof typeof logoSizes
  negative?: boolean
  className?: string
}) {
  const s = logoSizes[size]
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <BrandMark variant={negative ? 'negative' : 'ink'} className={s.mark} />
      <span
        className={`font-display font-bold leading-none tracking-[-0.01em] ${s.text} ${negative ? 'text-espuma' : 'text-navalha'}`}
      >
        Seu Barbeiro
      </span>
    </span>
  )
}
