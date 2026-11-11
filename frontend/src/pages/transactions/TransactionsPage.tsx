import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTransactions } from '../../hooks/useTransactions'
import Pagination from '../../components/Pagination'
import TransactionCard from '../../components/TransactionCard'
import TransactionTable from '../../components/TransactionTable'
import type { Transaction } from '../../types/transaction'
import { getErrorMessage } from '../../utils/errorMessage'
import DeleteTransactionDialog from './DeleteTransactionDialog'
import TransactionFormModal from './TransactionFormModal'

// ?page=abc, ?page=-3 or no param -> page 1
function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

// null: closed. 'new': creating. A transaction: editing that one
type FormState = null | 'new' | Transaction

function TransactionsPage() {
  // The page lives in the URL, so reloading or going back keeps it
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const [formState, setFormState] = useState<FormState>(null)
  // The transaction waiting for delete confirmation, or null if the dialog is closed
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTransactions({ page })

  function handlePageChange(newPage: number) {
    setSearchParams({ page: String(newPage) })
    window.scrollTo({ top: 0 })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        {/* Desktop button. On mobile the floating "+" is used instead */}
        <button
          type="button"
          onClick={() => setFormState('new')}
          className="hidden min-h-11 rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700 md:block"
        >
          Nueva transacción
        </button>
      </div>

      {isPending ? (
        <p className="text-slate-500">Cargando transacciones…</p>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-medium">No se han podido cargar las transacciones.</p>
          <p className="text-sm">{getErrorMessage(error)}</p>
          <button
            type="button"
            className="mt-2 min-h-11 font-medium underline"
            onClick={() => refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : data.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          {page > 1 ? 'No hay transacciones en esta página.' : 'Todavía no has apuntado ninguna transacción.'}
        </p>
      ) : (
        // Slightly faded while the next page is loading (the previous one is still shown)
        <div className={`flex flex-col gap-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {/* Mobile: cards */}
          <ul className="flex flex-col gap-2 md:hidden">
            {data.data.map((transaction) => (
              <li key={transaction.id}>
                <TransactionCard transaction={transaction} onEdit={setFormState} onDelete={setTransactionToDelete} />
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <TransactionTable transactions={data.data} onEdit={setFormState} onDelete={setTransactionToDelete} />
          </div>

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Floating button on mobile, above the bottom navigation bar */}
      <button
        type="button"
        onClick={() => setFormState('new')}
        className="fixed right-4 bottom-20 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-lg active:bg-emerald-700 md:hidden"
        aria-label="Nueva transacción"
      >
        +
      </button>

      {/* Mounted only while open: each opening starts with a clean form and clean mutation state */}
      {formState !== null && (
        <TransactionFormModal
          transaction={formState === 'new' ? undefined : formState}
          onClose={() => setFormState(null)}
        />
      )}

      {transactionToDelete && (
        <DeleteTransactionDialog transaction={transactionToDelete} onClose={() => setTransactionToDelete(null)} />
      )}
    </section>
  )
}

export default TransactionsPage
