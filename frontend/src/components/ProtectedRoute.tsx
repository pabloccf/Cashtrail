import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errorMessage'
import FullPageMessage from './FullPageMessage'

// Layout route: the routes nested inside it are only rendered for a logged-in user
function ProtectedRoute() {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    return <FullPageMessage>Cargando…</FullPageMessage>
  }

  // Not a 401 (that becomes null): the backend is down or unreachable
  if (isError) {
    return (
      <FullPageMessage>
        <p>{getErrorMessage(error)}</p>
        <button type="button" className="min-h-11 font-medium text-emerald-700 underline" onClick={() => refetch()}>
          Reintentar
        </button>
      </FullPageMessage>
    )
  }

  if (!user) {
    // `state.from` remembers where the user wanted to go, so the login can send them back there.
    // `replace` avoids leaving the protected URL in the history (the back button would loop)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

export default ProtectedRoute
