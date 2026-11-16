import CategoryBarChart from '../../components/CategoryBarChart'
import SectionCard from '../../components/SectionCard'
import { useStatsByCategory } from '../../hooks/useStats'
import { formatMonth } from '../../utils/month'
import SectionError from './SectionError'

interface CategorySectionProps {
  month: string // "YYYY-MM"
}

// Loads the expenses by category of the month and hands them to the chart
function CategorySection({ month }: CategorySectionProps) {
  const { data, isPending, isError, error, refetch } = useStatsByCategory(month, 'EXPENSE')

  return (
    <SectionCard title="Gastos por categoría">
      {isPending ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : isError ? (
        <SectionError
          message="No se han podido cargar los gastos por categoría."
          error={error}
          onRetry={() => refetch()}
        />
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">No hay gastos en {formatMonth(month).toLowerCase()}.</p>
      ) : (
        <CategoryBarChart items={data} />
      )}
    </SectionCard>
  )
}

export default CategorySection
