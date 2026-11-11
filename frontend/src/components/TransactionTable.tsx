import type { Transaction } from '../types/transaction'
import { formatDate, toIsoDateOnly } from '../utils/date'
import CategoryBadge from './CategoryBadge'
import TransactionAmount from './TransactionAmount'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

// Desktop view of the transactions
function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
            <th scope="col" className="px-4 py-3 font-medium">Descripción</th>
            <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Importe</th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                <time dateTime={toIsoDateOnly(transaction.date)}>{formatDate(transaction.date)}</time>
              </td>
              <td className="px-4 py-3">
                {transaction.description || <span className="text-slate-400">Sin descripción</span>}
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={transaction.category} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <TransactionAmount amount={transaction.amount} type={transaction.type} />
              </td>
              {/* Real buttons instead of a clickable <tr>: they can be reached with the keyboard */}
              <td className="whitespace-nowrap px-2 py-1 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  className="min-h-11 rounded-lg px-3 font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(transaction)}
                  className="min-h-11 rounded-lg px-3 font-medium text-rose-600 hover:bg-rose-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable
