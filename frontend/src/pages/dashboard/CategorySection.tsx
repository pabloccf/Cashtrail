import CategoryBarChart from '../../components/CategoryBarChart'
import SectionCard from '../../components/SectionCard'
import { useStatsByCategory } from '../../hooks/useStats'
import { formatMonth } from '../../utils/month'
import ErrorState from '../../components/ErrorState'
import ListSkeleton from '../../components/ListSkeleton'

interface CategorySectionProps {
  month: string // "YYYY-MM"
}

// Loads the expenses by category of the month and hands them to the chart
function CategorySection({ month }: CategorySectionProps) {
  const { data, isPending, isError, error, refetch } = useStatsByCategory(month, 'EXPENSE')

  return (
    <SectionCard title="Gastos por categoría">
      {isPending ? (
        <ListSkeleton label="Cargando gráfico…" rows={1} rowClassName="h-56" />
      ) : isError ? (
        <ErrorState
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
