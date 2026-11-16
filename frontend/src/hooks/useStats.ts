import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStatsByCategory, getStatsMonthly, getStatsSummary } from '../api/stats'
import type { TransactionType } from '../types/transaction'

// Every stats query key starts with 'stats', so the mutations that change transactions or
// recurring transactions refresh all of them at once with invalidateQueries({ queryKey: ['stats'] })

export function useStatsSummary(month: string) {
  return useQuery({
    queryKey: ['stats', 'summary', month],
    queryFn: () => getStatsSummary(month),
    // While the next month loads, keep showing the current one instead of an empty loading state
    placeholderData: keepPreviousData,
  })
}

export function useStatsByCategory(month: string, type: TransactionType) {
  return useQuery({
    queryKey: ['stats', 'by-category', month, type],
    queryFn: () => getStatsByCategory(month, type),
    placeholderData: keepPreviousData,
  })
}

export function useStatsMonthly(month: string, months: number) {
  return useQuery({
    queryKey: ['stats', 'monthly', month, months],
    queryFn: () => getStatsMonthly(month, months),
    placeholderData: keepPreviousData,
  })
}
