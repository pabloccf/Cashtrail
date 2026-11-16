import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '../hooks/useAuth'
import FullPageMessage from './FullPageMessage'

const DEFAULT_PRIVATE_PATH = '/dashboard'

// `location.state` is typed as unknown: check its shape before trusting it
function getRedirectPath(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from
  }
  return DEFAULT_PRIVATE_PATH
}

// Layout route for /login and /register: a logged-in user has nothing to do there.
// It is also what redirects right after a successful login, when the user appears in the cache
function GuestRoute() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    return <FullPageMessage>Cargando…</FullPageMessage>
  }

  if (user) {
    return <Navigate to={getRedirectPath(location.state)} replace />
  }

  // Also when /auth/me failed (backend down): the form is shown and will show the error on submit
  return <Outlet />
}

export default GuestRoute
