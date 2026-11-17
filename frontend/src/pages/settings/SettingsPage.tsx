import { ChevronRight, Tags } from 'lucide-react'
import { Link } from 'react-router'
import { useCurrentUser } from '../../hooks/useAuth'
import ExportSection from './ExportSection'
import ProfileSection from './ProfileSection'

function SettingsPage() {
  // ProtectedRoute already loaded the user, so this reads it from the cache without a new request
  const { data: user } = useCurrentUser()

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {/* Mobile only: Categorías is not in the bottom bar (it is set up once and rarely changed),
          so it is reached from here. On desktop it is in the sidebar */}
      <Link
        to="/categories"
        className="flex min-h-14 items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-900/5 hover:bg-slate-50 md:hidden"
      >
        <Tags className="size-5 text-slate-500" aria-hidden="true" />
        <span className="flex-1">
          <span className="block font-medium">Categorías</span>
          <span className="block text-sm text-slate-500">Crea y edita tus categorías de gastos e ingresos</span>
        </span>
        <ChevronRight className="size-5 text-slate-400" aria-hidden="true" />
      </Link>

      {/* `user` is never null inside ProtectedRoute; the check only satisfies TypeScript */}
      {user && <ProfileSection user={user} />}

      <ExportSection />
    </section>
  )
}

export default SettingsPage
