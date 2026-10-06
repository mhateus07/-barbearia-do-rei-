import type { ReactNode } from 'react'
import { BrandMark } from '../../components/ui/BrandMark'

/** Moldura escura das páginas abertas pelo cliente (link do WhatsApp). */
export function PublicShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />
      <header className="relative border-b border-zinc-800/80">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-4">
          <BrandMark className="h-9 w-9" />
          <p className="font-display font-bold">{title || 'Seu horário'}</p>
        </div>
      </header>
      <main className="relative mx-auto max-w-lg animate-pop-in px-5 py-8">{children}</main>
    </div>
  )
}
