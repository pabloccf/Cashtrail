import { Check } from 'lucide-react'
import type { Transaction } from '../types/transaction'
import { formatDate, toIsoDateOnly } from '../utils/date'
import CategoryBadge from './CategoryBadge'
import TransactionAmount from './TransactionAmount'
import TransactionMarkers from './TransactionMarkers'
import TrashIcon from './TrashIcon'
import Card from './Card'

interface TransactionCardProps {
  transaction: Transaction
  // false when the list already shows the day in a heading (GroupedTransactionList)
  showDate?: boolean
  onEdit: (transaction: Transaction) => void
  onConfirm: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

// Mobile view of a transaction. Tapping the card opens it for editing; the trash icon deletes it.
// Pending ones also get a check button to confirm them.
// They are sibling buttons: HTML does not allow a button inside another button
function TransactionCard({ transaction, showDate = true, onEdit, onConfirm, onDelete }: TransactionCardProps) {
  return (
    <Card padding="none" className="flex items-stretch">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-l-2xl p-4 text-left active:bg-slate-50"
      >
        {/* min-w-0 lets `truncate` work inside a flex item */}
        <div className="min-w-0">
          <p className="truncate font-medium">{transaction.description || transaction.category.name}</p>
          {/* The marks go on the second line, which can wrap: next to the description they left
              too little room on mobile and cut it ("Agua …") */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryBadge category={transaction.category} />
            {showDate && (
              <time className="text-xs text-slate-500" dateTime={toIsoDateOnly(transaction.date)}>
                {formatDate(transaction.date)}
              </time>
            )}
            <TransactionMarkers transaction={transaction} />
          </div>
        </div>
        <TransactionAmount amount={transaction.amount} type={transaction.type} />
      </button>
      {transaction.status === 'PENDING' && (
        <button
          type="button"
          onClick={() => onConfirm(transaction)}
          className="flex w-12 shrink-0 items-center justify-center border-l border-slate-100 text-brand-600 active:bg-brand-50"
          aria-label="Confirmar registro"
        >
          <Check className="size-5" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl border-l border-slate-100 text-slate-400 active:bg-rose-50 active:text-rose-600"
        // An icon-only button needs a text for screen readers
        aria-label="Eliminar transacción"
      >
        <TrashIcon className="size-5" />
      </button>
    </Card>
  )
}

export default TransactionCard
