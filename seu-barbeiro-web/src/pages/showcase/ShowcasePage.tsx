import { useQuery } from '@tanstack/react-query'
import {
  getPublicInfo,
  getPublicServices,
  getPublicBarbers,
} from '../../api/public.api'
import { bookingLink } from '../../api/salon'
import { formatCurrency } from '../../utils/formatCurrency'
export function ShowcasePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['showcase'],
    queryFn: async () => {
      const [info, services, barbers] = await Promise.all([
        getPublicInfo(),
        getPublicServices(),
        getPublicBarbers(),
      ])
      return { info, services, barbers }
    },
  })
  if (isLoading) return <p>Carregando apresentação…</p>
  if (error || !data)
    return <p>Não foi possível carregar a apresentação do salão.</p>
  return (
    <main className="max-w-5xl mx-auto space-y-8">
      <section className="on-ink rounded-3xl bg-navalha text-espuma p-8 md:p-12 space-y-4">
        {data.info.shopLogo && (
          <img
            src={data.info.shopLogo}
            alt="Logo do salão"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        )}
        <h1 className="text-4xl font-bold">{data.info.shopName}</h1>
        <p className="text-toalha/80 max-w-xl">{data.info.shopDescription}</p>
        <a
          href={bookingLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-espuma text-navalha px-5 py-3 rounded-xl font-semibold hover:bg-white"
        >
          Agendar atendimento
        </a>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Nossos serviços</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.services.map((s) => (
            <article key={s.id} className="bg-white border rounded-2xl p-5">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-zinc-500 my-2">{s.description}</p>
              <p>
                {formatCurrency(Number(s.price))} ·{' '}
                {s.durationMin + s.processingMin + s.finishingMin} min
              </p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Nossa equipe</h2>
        <div className="flex gap-4 flex-wrap">
          {data.barbers.map((b) => (
            <article className="bg-white border rounded-xl p-4" key={b.id}>
              {b.avatarUrl && (
                <img
                  src={b.avatarUrl}
                  alt={b.name}
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
              )}
              <p>{b.name}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="text-sm text-zinc-500 space-y-1">
        <p>{data.info.shopAddress}</p>
        <p>{data.info.shopPhone}</p>
        <p>{data.info.shopInstagram}</p>
      </footer>
    </main>
  )
}
