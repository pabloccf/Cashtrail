import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../api/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    // Categories rarely change, so they stay fresh for 5 minutes
    staleTime: 5 * 60_000,
  })
}
