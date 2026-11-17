import { useSearchParams } from 'react-router'
import ErrorState from '../../components/ErrorState'
import MonthNavigator from '../../components/MonthNavigator'
import Skeleton from '../../components/Skeleton'
import SummaryCards from '../../components/SummaryCards'
import { useCurrentUser } from '../../hooks/useAuth'
import { useStatsSummary } from '../../hooks/useStats'
import { currentMonth, isValidMonth } from '../../utils/month'
import CategorySection from './CategorySection'
import MonthlySection from './MonthlySection'
import PendingSection from './PendingSection'
import RecentSection from './RecentSection'
import UpcomingSection from './UpcomingSection'

// Summary of a month. The month goes in the URL (?month=2026-10), like in the transactions page,
// so a reload or the back button keeps it. The current month is the default and is not written
function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  // No param (or an invalid one) -> the current month
  const month = monthParam && isValidMonth(monthParam) ? monthParam : currentMonth()

  const { data: summary, isPending, isError, error, refetch } = useStatsSummary(month)
  // ProtectedRoute already loaded the user, so this reads it from the cache without a new request
  const { data: user } = useCurrentUser()
  // Only the first name: "Hola, Pablo" instead of the full name
  const firstName = user?.name.trim().split(/\s+/)[0]
  const greeting = firstName ? `Hola, ${firstName}` : 'Inicio'

  function handleMonthChange(newMonth: string) {
    setSearchParams(newMonth === currentMonth() ? {} : { month: newMonth })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{greeting}</h1>
        {/* Not "este mes": the selector below can show any other month */}
        <p className="mt-1 text-slate-500">Tu resumen de ingresos y gastos.</p>
      </header>

      {/* First, what needs action. It does not depend on the month, so it goes above the selector */}
      <PendingSection />

      <MonthNavigator month={month} onMonthChange={handleMonthChange} />

      {isPending ? (
        // Same grid as SummaryCards (hero + one card), so nothing moves when the figures arrive
        <div role="status" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <span className="sr-only">Cargando resumen…</span>
          <Skeleton className="h-52 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-36 rounded-2xl lg:h-52" />
        </div>
      ) : isError ? (
        <ErrorState message="No se ha podido cargar el resumen del mes." error={error} onRetry={() => refetch()} />
      ) : (
        <SummaryCards summary={summary} />
      )}

      {/* Each chart loads on its own: one failing or loading does not hide the others.
          Stacked on mobile, side by side on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategorySection month={month} />
        <MonthlySection month={month} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentSection month={month} />
        <UpcomingSection />
      </div>
    </section>
  )
}

export default DashboardPage
