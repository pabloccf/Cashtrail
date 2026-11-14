import { Clock } from 'lucide-react'
import { useTransactions } from '../../hooks/useTransactions'

interface PendingBannerProps {
  onShowPending: () => void
}

// Warns about pending records in any month, not only the one on screen. Only the total is needed,
// so it asks for the smallest page. Its query key starts with 'transactions', so it is refreshed
// with the list after every change (create, confirm, delete...)
function PendingBanner({ onShowPending }: PendingBannerProps) {
  const { data } = useTransactions({ status: 'PENDING', page: 1, pageSize: 10 })
  const total = data?.pagination.total ?? 0
  if (total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-amber-900">
      <p className="flex items-center gap-2 py-2">
        <Clock className="size-5 shrink-0" aria-hidden="true" />
        {total === 1
          ? 'Tienes 1 registro pendiente de confirmar.'
          : `Tienes ${total} registros pendientes de confirmar.`}
      </p>
      <button
        type="button"
        onClick={onShowPending}
        className="min-h-11 rounded-lg px-3 font-medium underline hover:bg-amber-100"
      >
        Ver pendientes
      </button>
    </div>
  )
}

export default PendingBanner
