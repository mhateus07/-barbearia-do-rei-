import { useId } from 'react'

/** Símbolo do Seu Barbeiro: poste de barbeiro sobre o laranja da marca. */
export function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  const clipId = `sb-poste-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <clipPath id={clipId}>
          <rect x="25.5" y="19" width="13" height="29" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="15" fill="#FF9A0A" />
      <circle cx="32" cy="10.5" r="3.6" fill="#141210" />
      <rect x="22" y="14.5" width="20" height="4.5" rx="2.25" fill="#141210" />
      <rect x="25.5" y="19" width="13" height="29" fill="#FFF6E8" />
      <g clipPath={`url(#${clipId})`} fill="#141210">
        <path d="M18 30 L46 16 L46 21 L18 35Z" />
        <path d="M18 40.5 L46 26.5 L46 31.5 L18 45.5Z" />
        <path d="M18 51 L46 37 L46 42 L18 56Z" />
      </g>
      <rect x="23.5" y="48" width="17" height="4.5" rx="2.25" fill="#141210" />
      <rect x="27.5" y="52.5" width="9" height="2.5" rx="1.25" fill="#141210" />
    </svg>
  )
}
