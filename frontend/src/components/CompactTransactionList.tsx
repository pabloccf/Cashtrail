import type { Transaction } from '../types/transaction'
import { formatDayMonth, toIsoDateOnly } from '../utils/date'
import CategoryIcon from './CategoryIcon'
import TransactionAmount from './TransactionAmount'
import TransactionMarkers from './TransactionMarkers'

interface CompactTransactionListProps {
  transactions: Transaction[]
  // When given, pending records get a "Confirmar" button
  onConfirm?: (transaction: Transaction) => void
}

// Short list of transactions for the dashboard: icon, description, date and amount in one row.
// Read-only (editing and deleting live in /transactions), except for confirming pending ones
function CompactTransactionList({ transactions, onConfirm }: CompactTransactionListProps) {
  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="flex min-h-14 items-center gap-3 py-2">
          <CategoryIcon icon={transaction.category.icon} color={transaction.category.color} />
          {/* min-w-0 lets `truncate` work inside a flex item */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{transaction.description || transaction.category.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <time dateTime={toIsoDateOnly(transaction.date)}>{formatDayMonth(transaction.date)}</time>
              <TransactionMarkers transaction={transaction} />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <TransactionAmount amount={transaction.amount} type={transaction.type} />
            {onConfirm && transaction.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => onConfirm(transaction)}
                className="min-h-11 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700"
              >
                Confirmar
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CompactTransactionList
