import { useState } from 'react'
import { MapPin, Phone, AtSign, Star, X, ChevronLeft, ChevronRight } from 'lucide-react'

const PORTFOLIO_PHOTOS = [
  '/portfolio/75dc8c652fd64a0f91a4c6a159ef49-barbearia-do-rei-inspiration-e53ca531383f41fe9aee31babac288-booksy.jpeg',
  '/portfolio/f615664ac46d49d4afb9981372e03f-barbearia-do-rei-inspiration-0f6437cee6174298a263c0d070996c-booksy.jpeg',
  '/portfolio/fba6b49d5b62431a861f6b5fe20dc5-barbearia-do-rei-inspiration-e17a765aa2d3435bab2e9dc13eda7c-booksy.jpeg',
  '/portfolio/177bdb3b33c44c0b856a514ec9fdb5-barbearia-do-rei-inspiration-c415e770790b482b9a5caf60d316ab-booksy.jpeg',
  '/portfolio/d1a7f45a64e7414eab4b3e6fdc544e-barbearia-do-rei-inspiration-a68cd299c1fb4e83bcf779541b3c08-booksy.jpeg',
  '/portfolio/a29a58f246484c959eac004b01f653-barbearia-do-rei-inspiration-abe9b84e75324bc98f4304876a0403-booksy.jpeg',
  '/portfolio/3a94fb14a88f433180a9f4db774f5d-barbearia-do-rei-inspiration-2683a8237a0347c985b41f640efc20-booksy.jpeg',
  '/portfolio/df9e25d16ca5444ca60ecd4399a3bb-barbearia-do-rei-inspiration-fd385d576f5e422da7e0b633e30e60-booksy.jpeg',
  '/portfolio/0f22a1816bab4a9faafc2eee2f4e88-barbearia-do-rei-inspiration-6151c160bc344a2195e219f17fe484-booksy.jpeg',
  '/portfolio/ab563fbd31804dcb99613648f91887-barbearia-do-rei-inspiration-921d0cb6497d45fcb708e0dde6d742-booksy.jpeg',
  '/portfolio/43f8d9a488474942b34f382b1489a3-barbearia-do-rei-inspiration-2b8a30c279ba4ba4b53d34883abd50-booksy.jpeg',
  '/portfolio/b4c381ccfc01423abe053b414d2703-barbearia-do-rei-inspiration-5cc1b959c25f4d349bceada34d0cc5-booksy.jpeg',
  '/portfolio/9dfbeef9b32b4a56bba865c2eb5e07-barbearia-do-rei-inspiration-7dcfad4e1b5b43dbb2547519e7f877-booksy.jpeg',
  '/portfolio/88822834264a4b1bb6121f64ba2e8d-barbearia-do-rei-inspiration-f62ea71d5e6e47a3bf7843bc6d62ef-booksy.jpeg',
  '/portfolio/f6d58acc317d49d29a878465f19725-barbearia-do-rei-inspiration-8911db80819341388ea0f189ef6f74-booksy.jpeg',
  '/portfolio/bf3bddaeea454443a0cdf713dad8db-barbearia-do-rei-inspiration-477a20b36a0545ca8b1c77db7239de-booksy.jpeg',
  '/portfolio/490ed44df2e54c6b8bb72b577c42d7-barbearia-do-rei-inspiration-3ee175ec1e9d4ab587c92b7b9bb30a-booksy.jpeg',
  '/portfolio/9b021278a12d489bb6bf0b91410879-barbearia-do-rei-inspiration-93bfb3bdc3f740e9b5809c8828dad5-booksy.jpeg',
  '/portfolio/781ffe62882e49f28ac8a17a0e9711-barbearia-do-rei-inspiration-83a60c4ae1394b858a4c76a1ddab5d-booksy.jpeg',
  '/portfolio/d82aa2410d85400ca1d5d37d9f444e-barbearia-do-rei-inspiration-47295dc5d3934a9ca4233776c3e2fc-booksy.jpeg',
]

export function ShowcasePage() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  function openLightbox(index: number) {
    setLightbox(index)
  }

  function closeLightbox() {
    setLightbox(null)
  }

  function prev() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + PORTFOLIO_PHOTOS.length) % PORTFOLIO_PHOTOS.length)
  }

  function next() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % PORTFOLIO_PHOTOS.length)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img src="/logo.jpeg" alt="Barbearia do Rei" className="h-14 w-14 rounded-2xl object-cover shadow-md" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Barbearia do Rei</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm font-semibold text-amber-600 ml-1">5.0</span>
            <span className="text-sm text-zinc-400">· 32 avaliações</span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5 italic">
            "Não é só corte, é cuidado. Na Barbearia do Rei, sua imagem é prioridade."
          </p>
        </div>
      </div>

      {/* Info + Mapa */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Informações */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-800">Informações</h2>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <MapPin className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">Endereço</p>
              <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
                Rua Jose Narcisio Silva, 1003 — Bairro Fábricas<br />
                Próximo à Ponte dos Cachorros (Oficina do Marconi)<br />
                CEP 36301-206 · São João del Rei — MG
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Phone className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">Telefone / WhatsApp</p>
              <p className="text-sm text-zinc-500 mt-0.5">(32) 99160-8852</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <AtSign className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">Instagram</p>
              <p className="text-sm text-zinc-500 mt-0.5">@opedro.seubarbeiro</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Horários de Funcionamento</p>
            <div className="space-y-1">
              {[
                { dias: 'Segunda — Sexta', horario: '08:00 às 19:00' },
                { dias: 'Sábado', horario: '08:00 às 16:00' },
                { dias: 'Domingo', horario: 'Fechado' },
              ].map((h) => (
                <div key={h.dias} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">{h.dias}</span>
                  <span className={`text-sm font-medium ${h.horario === 'Fechado' ? 'text-red-400' : 'text-zinc-800'}`}>
                    {h.horario}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-base font-semibold text-zinc-800">Localização</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Rua Jose Narcisio Silva, 1003 — São João del Rei</p>
          </div>
          <iframe
            title="Localização Barbearia do Rei"
            src="https://maps.google.com/maps?q=Rua+Jose+Narcisio+Silva+1003+Fabricas+Sao+Joao+del+Rei+MG+36301-206+Brazil&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="320"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Portfolio */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-800">Portfólio</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{PORTFOLIO_PHOTOS.length} trabalhos · Clique para ampliar</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {PORTFOLIO_PHOTOS.map((photo, index) => (
            <button
              key={photo}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <img
                src={photo}
                alt={`Trabalho ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={PORTFOLIO_PHOTOS[lightbox]}
            alt={`Trabalho ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {lightbox + 1} / {PORTFOLIO_PHOTOS.length}
          </div>
        </div>
      )}
    </div>
  )
}
