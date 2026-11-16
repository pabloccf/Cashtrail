import ChartCard from '../../components/ChartCard'
import MonthlyBarChart from '../../components/MonthlyBarChart'
import { useStatsMonthly } from '../../hooks/useStats'
import SectionError from './SectionError'

interface MonthlySectionProps {
  month: string // "YYYY-MM", the last month of the chart
}

// Six bars fit comfortably on a phone
const MONTHS = 6

// Loads income and expenses of the last months (ending at the chosen one) and hands them to the chart
function MonthlySection({ month }: MonthlySectionProps) {
  const { data, isPending, isError, error, refetch } = useStatsMonthly(month, MONTHS)

  return (
    <ChartCard title={`Ingresos y gastos · últimos ${MONTHS} meses`}>
      {isPending ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : isError ? (
        <SectionError message="No se ha podido cargar la evolución mensual." error={error} onRetry={() => refetch()} />
      ) : data.every((row) => row.income === 0 && row.expense === 0) ? (
        // Without this, an empty chart would show "0 €" on every line of the axis
        <p className="text-sm text-slate-500">No hay movimientos en estos meses.</p>
      ) : (
        <MonthlyBarChart data={data} />
      )}
    </ChartCard>
  )
}

export default MonthlySection
