import { useState } from 'react'
import { isAxiosError } from 'axios'
import { publicApi } from '../../api/public.api'

export function PublicWaitlist({
  date,
  barberId,
  serviceIds,
}: {
  date: string
  barberId: string
  serviceIds: string[]
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await publicApi.post('/waitlist', {
        name: form.get('name'),
        phone: form.get('phone'),
        contactConsent: form.has('consent'),
        date,
        barberId,
        serviceIds,
      })
      setDone(true)
    } catch (error) {
      setError(
        isAxiosError(error)
          ? error.response?.data?.message || 'Tente novamente.'
          : 'Tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }
  if (done)
    return (
      <p role="status" className="mt-4 text-emerald-400">
        Solicitação registrada. O salão poderá avisar você se surgir uma vaga
        nesta data.
      </p>
    )
  return (
    <div className="mt-4">
      {!open ? (
        <button
          className="rounded-xl border border-amber-500 text-amber-400 px-4 py-3"
          onClick={() => setOpen(true)}
        >
          Quero entrar na lista de espera
        </button>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-3 text-left max-w-sm mx-auto"
        >
          <label className="block text-sm text-zinc-300">
            Seu nome
            <input
              required
              minLength={2}
              name="name"
              className="block w-full mt-1 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-espuma outline-hidden focus:border-amber-500"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            WhatsApp com DDD
            <input
              required
              name="phone"
              type="tel"
              className="block w-full mt-1 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-espuma outline-hidden focus:border-amber-500"
            />
          </label>
          <label className="flex items-start gap-2 text-xs text-zinc-400">
            <input required name="consent" type="checkbox" />
            Quero receber um aviso sobre uma vaga nesta data.
          </label>
          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="rounded-xl bg-amber-500 text-zinc-950 px-4 py-3 font-semibold disabled:opacity-50"
          >
            {busy ? 'Registrando…' : 'Entrar na lista'}
          </button>
        </form>
      )}
    </div>
  )
}
