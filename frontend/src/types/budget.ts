// Mirrors what the backend returns for /budgets
import type { TransactionCategory } from './transaction'

export interface Budget {
  id: string
  month: string // "YYYY-MM"
  amount: number // In cents: the limit for the month
  spent: number // In cents: CONFIRMED expenses of the category in that month (pending ones do not count)
  category: TransactionCategory
}

// Body of POST /budgets
export interface CreateBudgetInput {
  categoryId: string
  amount: number // In cents
  month: string // "YYYY-MM"
}

// Body of PUT /budgets/:id. Only the amount can change: another category or month is another budget
export interface UpdateBudgetInput {
  amount: number // In cents
}
