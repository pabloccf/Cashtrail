import SectionCard from '../../components/SectionCard'
import UpcomingList from '../../components/UpcomingList'
import { useUpcomingRecurring } from '../../hooks/useRecurring'
import SectionError from './SectionError'

const DAYS = 30
// A long list would push the rest of the dashboard down; the full list is in /recurring
const VISIBLE = 6

// Upcoming recurring income and expenses. Always from today, whatever month is on screen
function UpcomingSection() {
  const { data, isPending, isError, error, refetch } = useUpcomingRecurring(DAYS)

  return (
    <SectionCard title={`Próximos fijos · ${DAYS} días`} link={{ to: '/recurring', label: 'Ver fijos' }}>
      {isPending ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : isError ? (
        <SectionError message="No se han podido cargar los próximos fijos." error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">No hay gastos ni ingresos fijos en los próximos {DAYS} días.</p>
      ) : (
        <>
          <UpcomingList items={data.slice(0, VISIBLE)} />
          {data.length > VISIBLE && (
            <p className="text-xs text-slate-500">Y {data.length - VISIBLE} más en los próximos {DAYS} días.</p>
          )}
        </>
      )}
    </SectionCard>
  )
}

export default UpcomingSection
