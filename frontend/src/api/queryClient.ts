import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'
import { CURRENT_USER_QUERY_KEY } from './auth'

// If any request answers 401, the session expired (or the cookie was deleted).
// Marking the user as logged out makes ProtectedRoute send them to /login
function handleUnauthorized(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null)
  }
}

// A single cache shared by the whole app
export const queryClient = new QueryClient({
  // These callbacks run for every query/mutation, so the 401 check lives in one place
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
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
