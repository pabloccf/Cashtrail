import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTransactions } from '../../hooks/useTransactions'
import PageSizeSelect from '../../components/PageSizeSelect'
import Pagination from '../../components/Pagination'
import TransactionCard from '../../components/TransactionCard'
import TransactionTable from '../../components/TransactionTable'
import type { Transaction } from '../../types/transaction'
import { getErrorMessage } from '../../utils/errorMessage'
import { currentMonth, formatMonth } from '../../utils/month'
import { loadPageSize, PAGE_SIZE_OPTIONS, parsePageSize, savePageSize, type PageSize } from '../../utils/pageSize'
import {
  ALL_MONTHS,
  FILTER_KEYS,
  hasActiveFilters,
  parseTransactionFilters,
  parseTransactionPeriod,
  periodDateRange,
} from '../../utils/transactionFilters'
import ConfirmTransactionModal from '../../components/ConfirmTransactionModal'
import DeleteTransactionDialog from './DeleteTransactionDialog'
import MonthSelector from './MonthSelector'
import PendingBanner from './PendingBanner'
import TransactionFilters, { type FilterChanges } from './TransactionFilters'
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
  // The function (not its result) is passed to useState, so localStorage is read only on the first render.
  // The URL wins over the remembered size, so a shared link shows the same page to everyone
  const [storedPageSize] = useState(loadPageSize)
  const pageSize = parsePageSize(searchParams.get('pageSize')) ?? storedPageSize
  const filters = parseTransactionFilters(searchParams)
  const period = parseTransactionPeriod(searchParams, filters)
  const isFiltering = hasActiveFilters(filters)
  const [formState, setFormState] = useState<FormState>(null)
  // The transaction waiting for delete confirmation, or null if the dialog is closed
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  // The pending record being confirmed, or null if the modal is closed
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTransactions({
    ...filters,
    ...periodDateRange(period, filters),
    page,
    pageSize,
  })

  // Sets each param, or removes it when its value is undefined, and goes back to page 1
  // (page 3 of the old results may not exist after the change).
  // The updater form `setSearchParams(prev => ...)` starts from the current URL, so it only touches
  // the params it changes. Passing a plain object would replace the whole query string
  function updateSearchParams(changes: Record<string, string | undefined>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      next.delete('page')
      return next
    })
  }

  function handleFiltersChange(changes: FilterChanges) {
    updateSearchParams(changes)
  }

  function handleClearFilters() {
    updateSearchParams(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])))
  }

  // The current month is the default, so it is left out of the URL (like page 1)
  function handleMonthChange(month: string) {
    updateSearchParams({ month: month === currentMonth() ? undefined : month })
  }

  // Pending records can be in any month, so the month limit is removed too
  function handleShowPending() {
    updateSearchParams({ status: 'PENDING', month: ALL_MONTHS })
  }

  function handleClearRange() {
    updateSearchParams({ from: undefined, to: undefined })
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      // Page 1 is the default, so it is left out of the URL
      if (newPage > 1) next.set('page', String(newPage))
      else next.delete('page')
      return next
    })
    window.scrollTo({ top: 0 })
  }

  // Page 3 of 10 and page 3 of 50 show different rows, so it starts over (updateSearchParams does that)
  function handlePageSizeChange(newPageSize: PageSize) {
    savePageSize(newPageSize)
    updateSearchParams({ pageSize: String(newPageSize) })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        {/* Desktop button. On mobile the floating "+" is used instead */}
        <button
          type="button"
          onClick={() => setFormState('new')}
          className="hidden min-h-11 rounded-lg bg-brand-600 px-4 font-medium text-white hover:bg-brand-700 md:block"
        >
          Nueva transacción
        </button>
      </div>

      {/* Hidden while the list already shows only the pending ones */}
      {filters.status !== 'PENDING' && <PendingBanner onShowPending={handleShowPending} />}

      <MonthSelector period={period} onMonthChange={handleMonthChange} onClearRange={handleClearRange} />

      <TransactionFilters filters={filters} onChange={handleFiltersChange} onClear={handleClearFilters} />

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
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          {isFiltering ? (
            <>
              <p>
                No hay transacciones que coincidan con los filtros
                {period.kind === 'month' && ` en ${formatMonth(period.month).toLowerCase()}`}.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4">
                {/* The search only looks inside the chosen month, so offer to look in all of them */}
                {period.kind === 'month' && (
                  <button
                    type="button"
                    onClick={() => handleMonthChange(ALL_MONTHS)}
                    className="min-h-11 font-medium text-brand-700 underline"
                  >
                    Buscar en todos los meses
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="min-h-11 font-medium text-brand-700 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            </>
          ) : period.kind === 'month' && page === 1 ? (
            <>
              <p>No hay transacciones en {formatMonth(period.month).toLowerCase()}.</p>
              <button
                type="button"
                onClick={() => handleMonthChange(ALL_MONTHS)}
                className="mt-2 min-h-11 font-medium text-brand-700 underline"
              >
                Ver todos los meses
              </button>
            </>
          ) : (
            <p>{page > 1 ? 'No hay transacciones en esta página.' : 'Todavía no has apuntado ninguna transacción.'}</p>
          )}
        </div>
      ) : (
        // Slightly faded while the next page is loading (the previous one is still shown)
        <div className={`flex flex-col gap-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {/* Mobile: cards */}
          <ul className="flex flex-col gap-2 md:hidden">
            {data.data.map((transaction) => (
              <li key={transaction.id}>
                <TransactionCard
                  transaction={transaction}
                  onEdit={setFormState}
                  onConfirm={setTransactionToConfirm}
                  onDelete={setTransactionToDelete}
                />
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <TransactionTable
              transactions={data.data}
              onEdit={setFormState}
              onConfirm={setTransactionToConfirm}
              onDelete={setTransactionToDelete}
            />
          </div>

          {/* Mobile: pagination above the size selector. Desktop: both in one row */}
          <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            {/* With fewer rows than the smallest option, changing the size would change nothing */}
            {data.pagination.total > PAGE_SIZE_OPTIONS[0] && (
              <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
            )}
            <div className="md:ml-auto md:w-96">
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating button on mobile, above the bottom navigation bar */}
      <button
        type="button"
        onClick={() => setFormState('new')}
        className="fixed right-4 bottom-20 flex size-14 items-center justify-center rounded-full bg-brand-600 text-3xl text-white shadow-lg active:bg-brand-700 md:hidden"
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

      {transactionToConfirm && (
        <ConfirmTransactionModal transaction={transactionToConfirm} onClose={() => setTransactionToConfirm(null)} />
      )}

      {transactionToDelete && (
        <DeleteTransactionDialog transaction={transactionToDelete} onClose={() => setTransactionToDelete(null)} />
      )}
    </section>
  )
}

export default TransactionsPage
