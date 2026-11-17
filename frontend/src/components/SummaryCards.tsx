import { CalendarClock } from 'lucide-react'
import type { StatsSummary } from '../types/stats'
import { useMoney } from '../hooks/useMoney'
import BalanceHero from './BalanceHero'
import StatCard, { type StatTone } from './StatCard'

interface SummaryCardsProps {
  summary: StatsSummary
}

// Green above zero, red below. Zero stays neutral
function signTone(amount: number): StatTone {
  if (amount > 0) return 'positive'
  if (amount < 0) return 'negative'
  return 'neutral'
}

// The figures of a month: the balance as the hero (with income and expenses inside it) and the
// estimated balance at the end of the month next to it. It receives the data by props and does not
// fetch anything, so the shared dashboard (phase 8) can reuse it with the data of a shared space
function SummaryCards({ summary }: SummaryCardsProps) {
  const { formatMoney } = useMoney()
  const { income, expense } = summary.remainingRecurring
  const hasRemaining = income > 0 || expense > 0

  return (
    // Stacked on mobile. On large screens the hero takes two thirds of the row
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BalanceHero
          month={summary.month}
          balance={summary.balance}
          income={summary.income}
          expense={summary.expense}
        />
      </div>
      <StatCard
        label="Saldo estimado a fin de mes"
        amount={summary.estimatedBalance}
        tone={signTone(summary.estimatedBalance)}
        icon={CalendarClock}
      >
        {hasRemaining ? (
          <>
            Cuenta los fijos que faltan:
            {income > 0 && <span className="block text-emerald-700">+{formatMoney(income)} de ingresos</span>}
            {expense > 0 && <span className="block text-rose-700">−{formatMoney(expense)} de gastos</span>}
          </>
        ) : (
          'No quedan fijos por llegar este mes.'
        )}
      </StatCard>
    </div>
  )
}

export default SummaryCards
