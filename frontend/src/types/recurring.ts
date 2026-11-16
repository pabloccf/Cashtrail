// Mirrors what the backend returns for /recurring. Dates arrive as ISO strings because JSON has no Date type
import type { TransactionCategory, TransactionType } from './transaction'

export type Frequency = 'MONTHLY' | 'YEARLY'

// AUTO: records are created as confirmed. CONFIRM: records are created as pending
export type RecurringMode = 'AUTO' | 'CONFIRM'

export interface RecurringTransaction {
  id: string
  categoryId: string
  amount: number // In cents, always positive. The sign comes from `type`
  description: string
  type: TransactionType
  frequency: Frequency
  dayOfMonth: number // 1-31. Shorter months use their last day
  monthOfYear: number | null // 1-12, only for YEARLY
  startDate: string // "2026-01-01T00:00:00.000Z"
  endDate: string | null // null: it never ends
  mode: RecurringMode
  active: boolean
  lastGeneratedAt: string | null
  createdAt: string
  category: TransactionCategory
}

// Body of POST /recurring and PUT /recurring/:id
export interface RecurringInput {
  amount: number // In cents
  type: TransactionType
  categoryId: string
  description: string
  frequency: Frequency
  dayOfMonth: number
  monthOfYear: number | null
  startDate: string // "YYYY-MM-DD"
  endDate: string | null // "YYYY-MM-DD"
  mode: RecurringMode
}

// One item of GET /recurring/upcoming: a future record of a recurring transaction that the
// daily job has not created yet
export interface UpcomingOccurrence {
  recurringTransactionId: string
  date: string // "2026-11-20T00:00:00.000Z"
  amount: number // In cents
  type: TransactionType
  description: string
  mode: RecurringMode
  category: TransactionCategory
}
