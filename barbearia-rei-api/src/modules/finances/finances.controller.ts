import { Response } from 'express'
import { ExpenseStatus } from '@prisma/client'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, paginate, apiError } from '../../utils/response'
import {
  listPayments,
  createPayment,
  deletePayment,
  listExpenses,
  createExpense,
  updateExpense,
  payExpense,
  deleteExpense,
  getFinancialSummary,
  getCommissions,
} from './finances.service'

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export async function listPaymentsHandler(req: AuthRequest, res: Response) {
  const { from, to, method, page = '1', limit = '50' } = req.query as Record<string, string>
  const result = await listPayments({ from, to, method, page: Number(page), limit: Number(limit) })
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function createPaymentHandler(req: AuthRequest, res: Response) {
  try {
    return success(res, await createPayment(req.body), 201)
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function deletePaymentHandler(req: AuthRequest, res: Response) {
  try {
    await deletePayment(req.params.id)
    return success(res, { message: 'Pagamento removido com sucesso' })
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export async function listExpensesHandler(req: AuthRequest, res: Response) {
  const { status, from, to, category, page = '1', limit = '50' } = req.query as Record<string, string>
  const result = await listExpenses({
    status: status as ExpenseStatus,
    from,
    to,
    category,
    page: Number(page),
    limit: Number(limit),
  })
  return paginate(res, result.data, { total: result.total, page: result.page, limit: result.limit })
}

export async function createExpenseHandler(req: AuthRequest, res: Response) {
  try {
    return success(res, await createExpense(req.body), 201)
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function updateExpenseHandler(req: AuthRequest, res: Response) {
  try {
    return success(res, await updateExpense(req.params.id, req.body))
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function payExpenseHandler(req: AuthRequest, res: Response) {
  try {
    return success(res, await payExpense(req.params.id, req.body))
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

export async function deleteExpenseHandler(req: AuthRequest, res: Response) {
  try {
    await deleteExpense(req.params.id)
    return success(res, { message: 'Despesa removida com sucesso' })
  } catch (err) {
    return apiError(res, (err as Error).message, 400)
  }
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

export async function summaryHandler(req: AuthRequest, res: Response) {
  const { from, to } = req.query as Record<string, string>
  return success(res, await getFinancialSummary(from, to))
}

// ─── COMMISSIONS ─────────────────────────────────────────────────────────────

export async function commissionsHandler(req: AuthRequest, res: Response) {
  const { from, to } = req.query as Record<string, string>
  return success(res, await getCommissions(from, to))
}
