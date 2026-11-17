import { useSearchParams } from 'react-router'
import ErrorState from '../../components/ErrorState'
import MonthNavigator from '../../components/MonthNavigator'
import Skeleton from '../../components/Skeleton'
import SummaryCards from '../../components/SummaryCards'
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

  function handleMonthChange(newMonth: string) {
    setSearchParams(newMonth === currentMonth() ? {} : { month: newMonth })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Inicio</h1>

      {/* First, what needs action. It does not depend on the month, so it goes above the selector */}
      <PendingSection />

      <MonthNavigator month={month} onMonthChange={handleMonthChange} />

      {isPending ? (
        // Same grid as SummaryCards, so nothing moves when the figures arrive
        <div role="status" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <span className="sr-only">Cargando resumen…</span>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
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
