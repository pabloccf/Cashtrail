import { ChevronLeft, ChevronRight } from 'lucide-react'
import { currentMonth, formatMonth, shiftMonth } from '../../utils/month'
import { ALL_MONTHS, type TransactionPeriod } from '../../utils/transactionFilters'

interface MonthSelectorProps {
  period: TransactionPeriod
  // A "YYYY-MM" month, or ALL_MONTHS to show every month
  onMonthChange: (month: string) => void
  // Removes the custom "Desde"/"Hasta" range, going back to the month view
  onClearRange: () => void
}

const arrowClass =
  'flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100'

const textButtonClass =
  'min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50'

function MonthSelector({ period, onMonthChange, onClearRange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
      {period.kind === 'month' ? (
        <>
          <button
            type="button"
            className={arrowClass}
            onClick={() => onMonthChange(shiftMonth(period.month, -1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          {/* aria-live: screen readers announce the new month after pressing an arrow */}
          <p className="flex-1 text-center font-semibold md:flex-none md:min-w-48" aria-live="polite">
            {formatMonth(period.month)}
          </p>
          <button
            type="button"
            className={arrowClass}
            onClick={() => onMonthChange(shiftMonth(period.month, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={`${textButtonClass} md:ml-auto`} onClick={() => onMonthChange(ALL_MONTHS)}>
            Ver todo
          </button>
        </>
      ) : (
        <>
          <p className="flex-1 px-3 font-semibold">
            {period.kind === 'all' ? 'Todos los meses' : 'Rango de fechas personalizado'}
          </p>
          <button
            type="button"
            className={textButtonClass}
            onClick={() => (period.kind === 'all' ? onMonthChange(currentMonth()) : onClearRange())}
          >
            Ver por mes
          </button>
        </>
      )}
    </div>
  )
}

export default MonthSelector
