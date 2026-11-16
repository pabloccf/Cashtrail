import { useQuery } from '@tanstack/react-query'
import { getRecurring, getUpcomingRecurring } from '../api/recurring'

export function useRecurring() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: getRecurring,
  })
}

// The key starts with 'recurring', so every change to a recurring transaction refreshes it too
export function useUpcomingRecurring(days: number) {
  return useQuery({
    queryKey: ['recurring', 'upcoming', days],
    queryFn: () => getUpcomingRecurring(days),
  })
}
