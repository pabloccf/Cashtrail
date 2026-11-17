import MonthNavigator from '../../components/MonthNavigator'
import { currentMonth } from '../../utils/month'
import { ALL_MONTHS, type TransactionPeriod } from '../../utils/transactionFilters'
import Card from '../../components/Card'

interface MonthSelectorProps {
  period: TransactionPeriod
  // A "YYYY-MM" month, or ALL_MONTHS to show every month
  onMonthChange: (month: string) => void
  // Removes the custom "Desde"/"Hasta" range, going back to the month view
  onClearRange: () => void
}

const textButtonClass =
  'min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-brand-700 hover:bg-brand-50'

// The month arrows plus the two other ways of looking at the list: every month or a custom range
function MonthSelector({ period, onMonthChange, onClearRange }: MonthSelectorProps) {
  if (period.kind === 'month') {
    return (
      <MonthNavigator month={period.month} onMonthChange={onMonthChange}>
        <button type="button" className={`${textButtonClass} md:ml-auto`} onClick={() => onMonthChange(ALL_MONTHS)}>
          Ver todo
        </button>
      </MonthNavigator>
    )
  }

  return (
    <Card padding="none" className="flex items-center gap-2 p-1">
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
    </Card>
  )
}

export default MonthSelector
