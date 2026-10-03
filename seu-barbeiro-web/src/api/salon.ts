// Slugs renomeados: links de agendamento já compartilhados continuam válidos.
const RENAMED: Record<string, string> = { 'barbearia-do-rei': 'seu-barbeiro' }

export function getSalon() {
  const salon =
    new URLSearchParams(window.location.search).get('salon') ||
    localStorage.getItem('salon') ||
    'seu-barbeiro'
  return RENAMED[salon] ?? salon
}
export function bookingLink() {
  return `${window.location.origin}/agendar?salon=${encodeURIComponent(getSalon())}`
}
