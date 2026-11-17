import SectionCard from '../../components/SectionCard'
import MonthlyBarChart from '../../components/MonthlyBarChart'
import { useStatsMonthly } from '../../hooks/useStats'
import ErrorState from '../../components/ErrorState'
import ListSkeleton from '../../components/ListSkeleton'

interface MonthlySectionProps {
  month: string // "YYYY-MM", the last month of the chart
}

// Six bars fit comfortably on a phone
const MONTHS = 6

// Loads income and expenses of the last months (ending at the chosen one) and hands them to the chart
function MonthlySection({ month }: MonthlySectionProps) {
  const { data, isPending, isError, error, refetch } = useStatsMonthly(month, MONTHS)

  return (
    <SectionCard title={`Ingresos y gastos · últimos ${MONTHS} meses`}>
      {isPending ? (
        <ListSkeleton label="Cargando gráfico…" rows={1} rowClassName="h-56" />
      ) : isError ? (
        <ErrorState message="No se ha podido cargar la evolución mensual." error={error} onRetry={() => refetch()} />
      ) : data.every((row) => row.income === 0 && row.expense === 0) ? (
        // Without this, an empty chart would show "0 €" on every line of the axis
        <p className="text-sm text-slate-500">No hay movimientos en estos meses.</p>
      ) : (
        <MonthlyBarChart data={data} />
      )}
    </SectionCard>
  )
}

export default MonthlySection
