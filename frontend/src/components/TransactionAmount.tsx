import type { TransactionType } from '../types/transaction'
import { formatMoney } from '../utils/money'

interface TransactionAmountProps {
  amount: number
  type: TransactionType
}

// Expenses in red with "−", income in green with "+"
function TransactionAmount({ amount, type }: TransactionAmountProps) {
  const isIncome = type === 'INCOME'
  return (
    // tabular-nums: all digits have the same width, so amounts line up in columns
    <span className={`font-semibold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
      {isIncome ? '+' : '−'}
      {formatMoney(amount)}
    </span>
  )
}

export default TransactionAmount
