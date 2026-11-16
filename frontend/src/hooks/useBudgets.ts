import { useQuery } from '@tanstack/react-query'
import { getBudgets } from '../api/budgets'

// The key starts with 'budgets', so invalidating ['budgets'] refreshes every month in the cache
export function useBudgets(month: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => getBudgets(month),
  })
}
