import BudgetProgressBar from '../../components/BudgetProgressBar'
import CategoryIcon from '../../components/CategoryIcon'
import TrashIcon from '../../components/TrashIcon'
import type { Budget } from '../../types/budget'
import { getBudgetProgress } from '../../utils/budget'
import { useMoney } from '../../hooks/useMoney'
import Card from '../../components/Card'

interface BudgetListItemProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
}

// Same structure as RecurringListItem: tapping the card edits, the trash icon deletes.
// They are sibling buttons: HTML does not allow nesting them
function BudgetListItem({ budget, onEdit, onDelete }: BudgetListItemProps) {
  const { formatMoney } = useMoney()
  const { amount, spent, category } = budget
  const { percent, level, remaining } = getBudgetProgress(spent, amount)

  return (
    <Card padding="none" className="flex items-stretch">
      <button
        type="button"
        onClick={() => onEdit(budget)}
        className="flex min-w-0 flex-1 flex-col gap-2 rounded-l-2xl p-3 text-left hover:bg-slate-50 active:bg-slate-50"
      >
        <div className="flex w-full items-center gap-3">
          <CategoryIcon icon={category.icon} color={category.color} />
          <p className="min-w-0 flex-1 truncate font-medium">{category.name}</p>
          {/* Over budget the percentage is red too: color alone is not enough, so the text also says it */}
          <p className={`shrink-0 text-sm font-semibold ${level === 'over' ? 'text-rose-600' : 'text-slate-600'}`}>
            {percent} %
          </p>
        </div>

        <BudgetProgressBar spent={spent} amount={amount} label={category.name} />

        {/* flex-wrap: on a narrow screen the second text drops to its own line instead of overflowing */}
        <div className="flex w-full flex-wrap justify-between gap-x-3 text-sm">
          <p className="text-slate-600">
            {formatMoney(spent)} de {formatMoney(amount)}
          </p>
          {remaining >= 0 ? (
            <p className="text-slate-500">Quedan {formatMoney(remaining)}</p>
          ) : (
            <p className="font-medium text-rose-600">Te has pasado {formatMoney(-remaining)}</p>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(budget)}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl border-l border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-50 active:text-rose-600"
        aria-label={`Eliminar presupuesto de ${category.name}`}
      >
        <TrashIcon className="size-5" />
      </button>
    </Card>
  )
}

export default BudgetListItem
