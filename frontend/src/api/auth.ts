import { ApiError, apiClient } from './client'
import type { AuthMethods, LoginInput, RegisterInput, UpdateProfileInput, User } from '../types/user'

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

// Sign in with Google is not a fetch call: the browser navigates here, the backend sends it to
// Google, and Google sends it back to /api/auth/google/callback, which redirects to the app
export const GOOGLE_SIGN_IN_URL = '/api/auth/google'

// Reasons the callback can send back in /login?error=… (backend: GoogleSignInFailure in auth.service.ts)
export type GoogleSignInError = 'google_cancelled' | 'google_failed' | 'email_not_verified' | 'account_exists'

// Same flow, started from /settings with the session: the callback links Google to the account
// and comes back to /settings?google=linked or /settings?google_error=…
export const GOOGLE_LINK_URL = '/api/auth/google/link'

// Reasons in /settings?google_error=… (backend: GoogleLinkFailure in auth.service.ts)
export type GoogleLinkError = 'google_cancelled' | 'google_failed' | 'google_in_use' | 'already_linked'

export function login(input: LoginInput) {
  return apiClient.post<User>('/auth/login', input)
}

export function register(input: RegisterInput) {
  return apiClient.post<User>('/auth/register', input)
}

export function logout() {
  return apiClient.post<void>('/auth/logout', undefined)
}

export function updateProfile(input: UpdateProfileInput) {
  return apiClient.put<User>('/auth/me', input)
}

export function getAuthMethods() {
  return apiClient.get<AuthMethods>('/auth/methods')
}

export function unlinkGoogle() {
  return apiClient.delete('/auth/methods/google')
}

// Only for accounts without a password (signed up with Google)
export function setPassword(password: string) {
  return apiClient.post<void>('/auth/password', { password })
}
