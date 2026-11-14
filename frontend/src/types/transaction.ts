// Mirrors what the backend returns. Dates arrive as ISO strings because JSON has no Date type

export type TransactionType = 'EXPENSE' | 'INCOME'

// PENDING records come from recurring transactions in CONFIRM mode and do not count until confirmed
export type TransactionStatus = 'CONFIRMED' | 'PENDING'

export interface TransactionCategory {
  id: string
  name: string
  color: string
  icon: string
}

export interface Transaction {
  id: string
  categoryId: string
  // Set when the record was generated from a recurring transaction. null for manual records
  // (and for records whose recurring transaction was deleted)
  recurringTransactionId: string | null
  amount: number // In cents, always positive. The sign comes from `type`
  description: string | null
  date: string // "2026-11-04T00:00:00.000Z" (a calendar day stored at 00:00 UTC)
  type: TransactionType
  status: TransactionStatus
  createdAt: string
  category: TransactionCategory
}

// Body of POST /transactions and PUT /transactions/:id
export interface TransactionInput {
  amount: number // In cents
  type: TransactionType
  categoryId: string
  date: string // "YYYY-MM-DD"
  description?: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}
