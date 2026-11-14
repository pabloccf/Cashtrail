import { useQuery } from '@tanstack/react-query'
import { getRecurring } from '../api/recurring'

export function useRecurring() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: getRecurring,
  })
}
