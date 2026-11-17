import CompactTransactionList from '../../components/CompactTransactionList'
import SectionCard from '../../components/SectionCard'
import { useTransactions } from '../../hooks/useTransactions'
import { currentMonth, formatMonth, monthRange } from '../../utils/month'
import ErrorState from '../../components/ErrorState'
import ListSkeleton from '../../components/ListSkeleton'

interface RecentSectionProps {
  month: string // "YYYY-MM"
}

// How many are shown. The API only accepts page sizes of 10, 25 or 50, so it asks for 10
const VISIBLE = 5

// Latest confirmed transactions of the chosen month. Pending ones have their own block
function RecentSection({ month }: RecentSectionProps) {
  const { data, isPending, isError, error, refetch } = useTransactions({
    ...monthRange(month),
    status: 'CONFIRMED',
    page: 1,
    pageSize: 10,
  })

  // Same URL the month selector of /transactions uses: the current month is not written
  const listUrl = month === currentMonth() ? '/transactions' : `/transactions?month=${month}`

  return (
    <SectionCard title="Últimas transacciones" link={{ to: listUrl, label: 'Ver todas' }}>
      {isPending ? (
        <ListSkeleton label="Cargando…" rows={4} rowClassName="h-12" />
      ) : isError ? (
        <ErrorState message="No se han podido cargar las transacciones." error={error} onRetry={() => refetch()} />
      ) : data.data.length === 0 ? (
        <p className="text-sm text-slate-500">No hay transacciones en {formatMonth(month).toLowerCase()}.</p>
      ) : (
        <CompactTransactionList transactions={data.data.slice(0, VISIBLE)} />
      )}
    </SectionCard>
  )
}

export default RecentSection
