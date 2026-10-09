// O server.ts fixa process.env.TZ no fuso do salão, então os métodos locais
// de Date (getDate, setHours...) já estão no horário da barbearia.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** "2026-10-09" vira o início (ou o fim) do dia no fuso do salão, não em UTC. */
export function parseDay(value: string, endOfDay = false) {
  if (!DATE_ONLY.test(value)) return new Date(value)
  return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`)
}

/** Chave "AAAA-MM-DD" do dia no fuso do salão, para agrupar por dia. */
export function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
