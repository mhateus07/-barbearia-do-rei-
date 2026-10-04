import { api } from './axios'

export interface BarberAdvance {
  id: string
  barberId: string
  barber: { id: string; name: string }
  amount: number | string
  notes?: string
  givenAt: string
  settledInId: string | null
}

export async function listOpenAdvances(): Promise<BarberAdvance[]> {
  const { data } = await api.get('/advances', { params: { open: 'true' } })
  return data
}
export async function createAdvance(input: {
  barberId: string
  amount: number
  notes?: string
  fromCash: boolean
}) {
  const { data } = await api.post('/advances', input)
  return data
}
export async function deleteAdvance(id: string) {
  await api.delete(`/advances/${id}`)
}

/** Mesma regra do servidor: desconta do mais antigo ao mais novo enquanto couber. */
export function previewDeduction(
  advances: BarberAdvance[],
  barberId: string,
  commission: number,
  periodTo: string,
) {
  const limit = new Date(`${periodTo}T23:59:59`).getTime()
  let total = 0
  for (const a of advances
    .filter((a) => a.barberId === barberId && new Date(a.givenAt).getTime() <= limit)
    .sort((x, y) => x.givenAt.localeCompare(y.givenAt))) {
    const next = total + Number(a.amount)
    if (Math.round(next * 100) > Math.round(commission * 100)) break
    total = next
  }
  return total
}
