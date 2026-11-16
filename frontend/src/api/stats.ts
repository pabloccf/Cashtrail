import { apiClient } from './client'
import type { CategoryTotal, MonthlyTotals, StatsSummary } from '../types/stats'
import type { TransactionType } from '../types/transaction'

// `month` is always sent: "the current month" is decided here, in the user's time zone,
// because the backend works in UTC

export function getStatsSummary(month: string) {
  return apiClient.get<StatsSummary>(`/stats/summary?month=${month}`)
}

export function getStatsByCategory(month: string, type: TransactionType) {
  return apiClient.get<CategoryTotal[]>(`/stats/by-category?month=${month}&type=${type}`)
}

// The `months` months ending at `month` (included)
export function getStatsMonthly(month: string, months: number) {
  return apiClient.get<MonthlyTotals[]>(`/stats/monthly?month=${month}&months=${months}`)
}
