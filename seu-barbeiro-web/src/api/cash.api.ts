import { api } from './axios'

export interface CashMovement {
  id: string
  kind: 'SUPPLY' | 'WITHDRAWAL'
  amount: number | string
  reason: string
  createdAt: string
}
export interface CashSummary {
  id: string
  openedAt: string
  closedAt: string | null
  openingAmount: number
  cashIn: number
  cashRefunds: number
  supplies: number
  withdrawals: number
  expected: number
  byMethod: Record<string, number>
  movements: CashMovement[]
  difference: number | null
}
export interface CashHistoryRow {
  id: string
  openedAt: string
  closedAt: string
  openingAmount: number
  expectedAmount: number
  countedAmount: number
  difference: number
  notes?: string
}

export const getCurrentCash = async (): Promise<CashSummary | null> =>
  (await api.get('/cash/current')).data
export const getCashHistory = async (): Promise<CashHistoryRow[]> =>
  (await api.get('/cash/history')).data
export const openCash = async (openingAmount: number) =>
  (await api.post('/cash/open', { openingAmount })).data
export const addCashMovement = async (input: {
  kind: 'SUPPLY' | 'WITHDRAWAL'
  amount: number
  reason: string
}) => (await api.post('/cash/movements', input)).data
export const closeCash = async (input: { countedAmount: number; notes?: string }) =>
  (await api.post('/cash/close', input)).data as CashSummary
