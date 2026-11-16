import { useSearchParams } from 'react-router'
import MonthNavigator from '../../components/MonthNavigator'
import SummaryCards from '../../components/SummaryCards'
import { useStatsSummary } from '../../hooks/useStats'
import { getErrorMessage } from '../../utils/errorMessage'
import { currentMonth, isValidMonth } from '../../utils/month'

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

      <MonthNavigator month={month} onMonthChange={handleMonthChange} />

      {isPending ? (
        <p className="text-slate-500">Cargando resumen…</p>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-medium">No se ha podido cargar el resumen del mes.</p>
          <p className="text-sm">{getErrorMessage(error)}</p>
          <button type="button" className="mt-2 min-h-11 font-medium underline" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <SummaryCards summary={summary} />
      )}
    </section>
  )
}

export default DashboardPage
