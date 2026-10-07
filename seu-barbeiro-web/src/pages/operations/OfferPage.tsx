import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../api/public.api'
export function OfferPage() {
  const token = new URLSearchParams(location.search).get('token') || ''
  const { data, error } = useQuery({
    queryKey: ['offer', token],
    retry: false,
    queryFn: async () =>
      (await publicApi.get(`/offers/${encodeURIComponent(token)}`)).data,
  })
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false)
  async function accept() {
    setBusy(true)
    try {
      await publicApi.post(`/offers/${encodeURIComponent(token)}/accept`)
      setDone(true)
      setMessage('Seu horário está reservado!')
    } catch {
      setMessage('A oferta expirou ou o horário não está mais disponível.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="min-h-dvh bg-zinc-50 grid place-items-center p-6 text-zinc-900">
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 space-y-4">
        <h1 className="text-2xl font-bold">Uma vaga para você</h1>
        {error ? (
          <p>Oferta expirada ou indisponível.</p>
        ) : data ? (
          <>
            <p>{new Date(data.startsAt).toLocaleString('pt-BR')}</p>
            <p>
              Confirme até{' '}
              {new Date(data.expiresAt).toLocaleTimeString('pt-BR')}.
            </p>
            <button
              disabled={busy || done}
              onClick={accept}
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-50"
            >
              {busy
                ? 'Reservando…'
                : done
                  ? 'Confirmado'
                  : 'Confirmar meu horário'}
            </button>
          </>
        ) : (
          <p>Consultando vaga…</p>
        )}
        <p role="status">{message}</p>
      </div>
    </main>
  )
}
