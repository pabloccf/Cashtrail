import type { TransactionType } from '../types/transaction'
import { currentMonth, isValidMonth, monthRange } from './month'

// Filters of the transactions list. They live in the URL (?type=EXPENSE&from=...), so reloading,
// sharing the link or going back keeps them. The names match the query params of GET /transactions
export interface TransactionFilters {
  q?: string
  type?: TransactionType
  category?: string
  from?: string // "YYYY-MM-DD"
  to?: string // "YYYY-MM-DD"
}

export const FILTER_KEYS = ['q', 'type', 'category', 'from', 'to'] as const satisfies readonly (keyof TransactionFilters)[]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The URL can be edited by hand, so invalid values are ignored instead of sending them to the API
// (which would answer 400 and leave the page in an error state)
export function parseTransactionFilters(searchParams: URLSearchParams): TransactionFilters {
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const validFrom = from && ISO_DATE.test(from) ? from : undefined
  const validTo = to && ISO_DATE.test(to) ? to : undefined
  // A range that ends before it starts (only possible by editing the URL) keeps just `from`.
  // "YYYY-MM-DD" strings sort the same way as the dates they represent
  const isRangeReversed = validFrom !== undefined && validTo !== undefined && validFrom > validTo

  return {
    q: searchParams.get('q')?.trim() || undefined,
    type: type === 'EXPENSE' || type === 'INCOME' ? type : undefined,
    category: category && UUID.test(category) ? category : undefined,
    from: validFrom,
    to: isRangeReversed ? undefined : validTo,
  }
}

// The search box is not counted: it is always visible, unlike the filters panel on mobile
export function countPanelFilters(filters: TransactionFilters): number {
  return [filters.type, filters.category, filters.from, filters.to].filter(Boolean).length
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return FILTER_KEYS.some((key) => filters[key] !== undefined)
}

// Which dates the list shows. A "discriminated union": `kind` tells which case it is,
// and TypeScript only allows `period.month` after checking `period.kind === 'month'`
export type TransactionPeriod =
  | { kind: 'month'; month: string } // One calendar month ("YYYY-MM"). The default
  | { kind: 'all' } // Every month (?month=all)
  | { kind: 'custom' } // A range typed in the "Desde"/"Hasta" filters, which wins over the month

export const ALL_MONTHS = 'all'

// `month` is not one of the FILTER_KEYS: it is how you move through the list, not a filter,
// so "Limpiar filtros" keeps the month you are looking at
export function parseTransactionPeriod(searchParams: URLSearchParams, filters: TransactionFilters): TransactionPeriod {
  if (filters.from || filters.to) return { kind: 'custom' }

  const month = searchParams.get('month')
  if (month === ALL_MONTHS) return { kind: 'all' }
  // No param (or an invalid one) -> the current month
  return { kind: 'month', month: month && isValidMonth(month) ? month : currentMonth() }
}

// The `from`/`to` sent to the API: the month's first and last day, the custom range, or nothing
export function periodDateRange(period: TransactionPeriod, filters: TransactionFilters): Pick<TransactionFilters, 'from' | 'to'> {
  if (period.kind === 'month') return monthRange(period.month)
  if (period.kind === 'custom') return { from: filters.from, to: filters.to }
  return {}
}
