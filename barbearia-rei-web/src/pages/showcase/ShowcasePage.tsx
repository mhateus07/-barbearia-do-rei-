import { useState } from 'react'
import { MapPin, Phone, AtSign, Star, X, ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
import { useBranding } from '../../contexts/branding-context'

const DAY_RANGES: { label: string; days: string[] }[] = [
  { label: 'Segunda — Sexta', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
  { label: 'Sábado', days: ['saturday'] },
  { label: 'Domingo', days: ['sunday'] },
]

function formatHours(val: string | undefined) {
  if (!val || val === 'closed') return 'Fechado'
  return val.replace('-', ' às ')
}

export function ShowcasePage() {
  const { branding } = useBranding()
  const photos = branding.portfolioImages
  const [lightbox, setLightbox] = useState<number | null>(null)

  function openLightbox(index: number) {
    setLightbox(index)
  }

  function closeLightbox() {
    setLightbox(null)
  }

  function prev() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + photos.length) % photos.length)
  }

  function next() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % photos.length)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.shopName} className="h-14 w-14 rounded-2xl object-cover shadow-md" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 shadow-md">
            <Scissors className="h-6 w-6 text-amber-500" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">{branding.shopName}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-zinc-500 mt-0.5 italic">
            "Não é só corte, é cuidado."
          </p>
        </div>
      </div>

      {/* Info + Mapa */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Informações */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-800">Informações</h2>

          {branding.shopAddress && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <MapPin className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">Endereço</p>
                <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{branding.shopAddress}</p>
              </div>
            </div>
          )}

          {branding.shopPhone && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Phone className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">Telefone / WhatsApp</p>
                <p className="text-sm text-zinc-500 mt-0.5">{branding.shopPhone}</p>
              </div>
            </div>
          )}

          {branding.shopInstagram && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <AtSign className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">Instagram</p>
                <p className="text-sm text-zinc-500 mt-0.5">{branding.shopInstagram}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Horários de Funcionamento</p>
            <div className="space-y-1">
              {DAY_RANGES.map((range) => {
                const horario = formatHours(branding.hours[range.days[0]])
                return (
                  <div key={range.label} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">{range.label}</span>
                    <span className={`text-sm font-medium ${horario === 'Fechado' ? 'text-red-400' : 'text-zinc-800'}`}>
                      {horario}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mapa */}
        {branding.shopAddress && (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-800">Localização</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{branding.shopAddress}</p>
            </div>
            <iframe
              title={`Localização ${branding.shopName}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(branding.shopAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>

      {/* Portfolio */}
      {photos.length > 0 && (
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-800">Portfólio</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{photos.length} trabalhos · Clique para ampliar</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo, index) => (
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
      )}

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
            src={photos[lightbox]}
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
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
}
