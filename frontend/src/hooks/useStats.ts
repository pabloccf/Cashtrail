import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStatsSummary } from '../api/stats'

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
