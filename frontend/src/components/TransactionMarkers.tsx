import { Repeat } from 'lucide-react'
import type { Transaction } from '../types/transaction'

interface TransactionMarkersProps {
  transaction: Pick<Transaction, 'recurringTransactionId' | 'status'>
}

// Small marks next to the description: an icon if the record comes from a recurring transaction,
// and a tag if it is waiting for confirmation. Shared by TransactionCard and TransactionTable
function TransactionMarkers({ transaction }: TransactionMarkersProps) {
  const isRecurring = transaction.recurringTransactionId !== null
  const isPending = transaction.status === 'PENDING'
  if (!isRecurring && !isPending) return null

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {isRecurring && (
        // `title` shows a tooltip on hover; the sr-only text is what screen readers read
        <span title="Generado a partir de un gasto o ingreso fijo" className="text-slate-400">
          <Repeat className="size-4" aria-hidden="true" />
          <span className="sr-only">Fijo</span>
        </span>
      )}
      {isPending && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800">
          Pendiente
        </span>
      )}
    </span>
  )
}

export default TransactionMarkers
