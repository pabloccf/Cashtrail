import BudgetProgressBar from '../../components/BudgetProgressBar'
import type { Budget } from '../../types/budget'
import { getBudgetProgress } from '../../utils/budget'
import { useMoney } from '../../hooks/useMoney'
import Card from '../../components/Card'

interface BudgetSummaryProps {
  budgets: Budget[]
}

// Every budget of the month added up. Only the categories with a budget count: spending in the
// others is not part of any limit
function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const { formatMoney } = useMoney()
  const amount = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const { percent, remaining } = getBudgetProgress(spent, amount)
  const overCount = budgets.filter((budget) => budget.spent > budget.amount).length

  return (
    <Card as="section" aria-labelledby="budget-summary-title" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="budget-summary-title" className="font-semibold">
          Total del mes
        </h2>
        <p className="text-sm font-semibold text-slate-600">{percent} %</p>
      </div>

      <p className="text-2xl font-bold">
        {formatMoney(spent)} <span className="text-base font-normal text-slate-500">de {formatMoney(amount)}</span>
      </p>

      <BudgetProgressBar spent={spent} amount={amount} label="Total del mes" />

      <div className="flex flex-wrap justify-between gap-x-3 text-sm text-slate-500">
        <p>{remaining >= 0 ? `Quedan ${formatMoney(remaining)}` : `Te has pasado ${formatMoney(-remaining)}`}</p>
        {overCount > 0 && (
          <p className="font-medium text-rose-600">
            {overCount === 1 ? '1 categoría por encima' : `${overCount} categorías por encima`}
          </p>
        )}
      </div>
    </Card>
  )
}

export default BudgetSummary
