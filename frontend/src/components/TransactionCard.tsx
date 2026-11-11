import type { Transaction } from '../types/transaction'
import { formatDate, toIsoDateOnly } from '../utils/date'
import CategoryBadge from './CategoryBadge'
import TransactionAmount from './TransactionAmount'

interface TransactionCardProps {
  transaction: Transaction
  onSelect: (transaction: Transaction) => void
}

// Mobile view of a transaction. The whole card is a button that opens it for editing
function TransactionCard({ transaction, onSelect }: TransactionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(transaction)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left active:bg-slate-50"
    >
      {/* min-w-0 lets `truncate` work inside a flex item */}
      <div className="min-w-0">
        <p className="truncate font-medium">{transaction.description || transaction.category.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryBadge category={transaction.category} />
          <time className="text-xs text-slate-500" dateTime={toIsoDateOnly(transaction.date)}>
            {formatDate(transaction.date)}
          </time>
        </div>
      </div>
      <TransactionAmount amount={transaction.amount} type={transaction.type} />
    </button>
  )
}

export default TransactionCard
