import type { Transaction } from '../types/transaction'
import { formatDate, toIsoDateOnly } from '../utils/date'
import CategoryBadge from './CategoryBadge'
import TransactionAmount from './TransactionAmount'
import TrashIcon from './TrashIcon'

interface TransactionCardProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

// Mobile view of a transaction. Tapping the card opens it for editing; the trash icon deletes it.
// They are two sibling buttons: HTML does not allow a button inside another button
function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  return (
    <div className="flex items-stretch rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-l-xl p-4 text-left active:bg-slate-50"
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
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-xl border-l border-slate-100 text-slate-400 active:bg-rose-50 active:text-rose-600"
        // An icon-only button needs a text for screen readers
        aria-label="Eliminar transacción"
      >
        <TrashIcon className="size-5" />
      </button>
    </div>
  )
}

export default TransactionCard
