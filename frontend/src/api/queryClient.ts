import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

// A single cache shared by the whole app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 s, so moving between pages does not refetch every time
      staleTime: 30_000,
      // 4xx errors (not found, invalid data...) will fail again, so only network or 5xx errors are retried
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
})
