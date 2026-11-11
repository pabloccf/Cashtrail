import { ApiError, apiClient } from './client'
import type { LoginInput, RegisterInput, User } from '../types/user'

// Cache key of "who is logged in". Lives here (not in the hook) so queryClient.ts can use it too
export const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const

// 401 is not an error here: it just means "nobody is logged in", so it becomes null.
// Any other failure (network, 500...) is still thrown
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiClient.get<User>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export function login(input: LoginInput) {
  return apiClient.post<User>('/auth/login', input)
}

export function register(input: RegisterInput) {
  return apiClient.post<User>('/auth/register', input)
}

export function logout() {
  return apiClient.post<void>('/auth/logout', undefined)
}
