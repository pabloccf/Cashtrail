import type { StatsSummary } from '../types/stats'
import { formatMoney } from '../utils/money'
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

// The four figures of a month. It receives the data by props and does not fetch anything,
// so the shared dashboard (phase 8) can reuse it with the data of a shared space
function SummaryCards({ summary }: SummaryCardsProps) {
  const { income, expense } = summary.remainingRecurring
  const hasRemaining = income > 0 || expense > 0

  return (
    // 2 columns on mobile, the 4 cards in a row on large screens
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Ingresos" amount={summary.income} tone="positive" />
      <StatCard label="Gastos" amount={summary.expense} tone="negative" />
      <StatCard label="Balance" amount={summary.balance} tone={signTone(summary.balance)} />
      <StatCard label="Saldo estimado a fin de mes" amount={summary.estimatedBalance} tone={signTone(summary.estimatedBalance)}>
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
