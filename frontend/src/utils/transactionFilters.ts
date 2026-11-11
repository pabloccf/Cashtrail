import type { TransactionType } from '../types/transaction'

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
