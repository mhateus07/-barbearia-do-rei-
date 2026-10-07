import { useEffect, useRef } from 'react'
import type { Video } from './videos'

/*
  Gravação real do sistema em loop, sem som (mesmo componente do site do
  Pedeli). Só baixa e toca quando aparece na tela e pausa quando sai, para não
  pesar a página. Quem pediu menos movimento no sistema vê só a capa. No
  celular, a versão de 960px.
*/

export function ScreenVideo({
  video,
  label,
  priority = false,
  className = '',
}: {
  video: Video
  label: string
  priority?: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.25) {
          el.preload = 'auto'
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: [0, 0.25] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload={priority ? 'auto' : 'none'}
      poster={video.poster}
      width={video.width}
      height={video.height}
      aria-label={label}
      className={className}
    >
      {video.srcSm && <source src={video.srcSm} type="video/mp4" media="(max-width: 767px)" />}
      <source src={video.src} type="video/mp4" />
    </video>
  )
}
