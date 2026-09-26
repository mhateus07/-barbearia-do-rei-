export function getSalon() {
  return (
    new URLSearchParams(window.location.search).get('salon') ||
    localStorage.getItem('salon') ||
    'barbearia-do-rei'
  )
}
export function bookingLink() {
  return `${window.location.origin}/agendar?salon=${encodeURIComponent(getSalon())}`
}
