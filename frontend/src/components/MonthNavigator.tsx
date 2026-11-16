import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth, shiftMonth } from '../utils/month'

interface MonthNavigatorProps {
  month: string // "YYYY-MM"
  onMonthChange: (month: string) => void
  // Extra actions shown after the month (e.g. "Ver todo" in the transactions page)
  children?: ReactNode
}

const arrowClass =
  'flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100'

// "‹ Noviembre de 2026 ›". Only moves between months: what to do with the month is up to each page
function MonthNavigator({ month, onMonthChange, children }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
      <button
        type="button"
        className={arrowClass}
        onClick={() => onMonthChange(shiftMonth(month, -1))}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      {/* aria-live: screen readers announce the new month after pressing an arrow */}
      <p className="flex-1 text-center font-semibold md:flex-none md:min-w-48" aria-live="polite">
        {formatMonth(month)}
      </p>
      <button
        type="button"
        className={arrowClass}
        onClick={() => onMonthChange(shiftMonth(month, 1))}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
      {children}
    </div>
  )
}

export default MonthNavigator
