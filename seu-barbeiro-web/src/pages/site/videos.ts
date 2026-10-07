// Gravações reais do sistema (salão fictício "Barbearia Aurora", atendimentos
// criados de verdade numa cópia local durante a gravação), em public/videos.
export type Video = { src: string; srcSm?: string; poster: string; width: number; height: number }

export const videos = {
  agenda: { src: '/videos/agenda.mp4', srcSm: '/videos/agenda-960.mp4', poster: '/videos/agenda.jpg', width: 1920, height: 1080 },
  agendamento: { src: '/videos/agendamento.mp4', poster: '/videos/agendamento.jpg', width: 660, height: 1248 },
} satisfies Record<string, Video>
