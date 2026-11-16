import { apiClient } from './client'
import type { StatsSummary } from '../types/stats'

// `month` is always sent: "the current month" is decided here, in the user's time zone,
// because the backend works in UTC
export function getStatsSummary(month: string) {
  return apiClient.get<StatsSummary>(`/stats/summary?month=${month}`)
}
