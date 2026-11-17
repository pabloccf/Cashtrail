import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { CURRENT_USER_QUERY_KEY, getCurrentUser, login, logout, register, updateProfile } from '../api/auth'
import type { User } from '../types/user'

// The TanStack Query cache is the single source of truth for "who is logged in":
// any component can call this hook, and only one request to /auth/me is made
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
  })
}

// Removes every cached query of the previous user (transactions, categories...), so none of
// their data can be shown to the next person who logs in on this browser.
// The current-user query is kept and only its value changes: ProtectedRoute and GuestRoute
// are subscribed to it, and replacing its value is what makes them redirect
function setSessionUser(queryClient: QueryClient, user: User | null) {
  queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== CURRENT_USER_QUERY_KEY[0] })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: login, onSuccess: (user) => setSessionUser(queryClient, user) })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: register, onSuccess: (user) => setSessionUser(queryClient, user) })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: logout, onSuccess: () => setSessionUser(queryClient, null) })
}

// The backend returns the updated user, so it is written straight into the cache instead of asking
// /auth/me again. Everything that reads useCurrentUser (the name in the sidebar...) updates at once
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user),
  })
}
