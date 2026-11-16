import { useState } from 'react'
import { useSearchParams } from 'react-router'
import MonthNavigator from '../../components/MonthNavigator'
import { useBudgets } from '../../hooks/useBudgets'
import { useCopyBudgets } from '../../hooks/useBudgetMutations'
import { useCategories } from '../../hooks/useCategories'
import type { Budget } from '../../types/budget'
import { getErrorMessage } from '../../utils/errorMessage'
import { currentMonth, formatMonth, isValidMonth, shiftMonth } from '../../utils/month'
import BudgetFormModal from './BudgetFormModal'
import BudgetListItem from './BudgetListItem'
import BudgetSummary from './BudgetSummary'
import DeleteBudgetDialog from './DeleteBudgetDialog'

// Same pattern as RecurringPage: null is closed, `kind` tells creating from editing
type FormState = null | { kind: 'new' } | { kind: 'edit'; budget: Budget }

// Monthly budgets. The month goes in the URL (?month=2026-10), like in the dashboard, so a reload
// or the back button keeps it. The current month is the default and is not written
function BudgetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const month = monthParam && isValidMonth(monthParam) ? monthParam : currentMonth()

  const { data: budgets, isPending, isError, error, refetch } = useBudgets(month)
  const categoriesQuery = useCategories()
  const copyMutation = useCopyBudgets()
  const [formState, setFormState] = useState<FormState>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)

  function handleMonthChange(newMonth: string) {
    setSearchParams(newMonth === currentMonth() ? {} : { month: newMonth })
  }

  // Expense categories without a budget this month: the only ones a new budget can use
  const usedCategoryIds = new Set(budgets?.map((budget) => budget.category.id))
  const availableCategories =
    categoriesQuery.data?.filter((category) => category.type === 'EXPENSE' && !usedCategoryIds.has(category.id)) ?? []
  const canAdd = budgets !== undefined && categoriesQuery.isSuccess && availableCategories.length > 0

  // The mutation keeps its last result after changing month, so the message is only shown for the
  // month it was run on (`variables` is the month passed to mutate)
  const copiedNothing = copyMutation.isSuccess && copyMutation.variables === month && copyMutation.data.copied === 0

  const addButton = (
    <button
      type="button"
      onClick={() => setFormState({ kind: 'new' })}
      disabled={!canAdd}
      className="min-h-11 rounded-lg px-3 font-medium text-emerald-700 hover:bg-emerald-50 disabled:text-slate-400 disabled:hover:bg-transparent"
    >
      + Añadir
    </button>
  )

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        {addButton}
      </div>

      <MonthNavigator month={month} onMonthChange={handleMonthChange} />

      {isPending ? (
        <p className="text-slate-500">Cargando presupuestos…</p>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-medium">No se han podido cargar los presupuestos.</p>
          <p className="text-sm">{getErrorMessage(error)}</p>
          <button type="button" className="mt-2 min-h-11 font-medium underline" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      ) : budgets.length === 0 ? (
        // Each month starts empty, so the empty state offers to bring last month's budgets
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-slate-500">No tienes presupuestos para {formatMonth(month).toLowerCase()}.</p>
          <button
            type="button"
            onClick={() => copyMutation.mutate(month)}
            disabled={copyMutation.isPending}
            className="min-h-11 rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {copyMutation.isPending ? 'Copiando…' : `Copiar los de ${formatMonth(shiftMonth(month, -1)).toLowerCase()}`}
          </button>
          {copiedNothing && (
            <p className="text-sm text-slate-500" role="status">
              {formatMonth(shiftMonth(month, -1))} no tiene presupuestos. Crea uno con «+ Añadir».
            </p>
          )}
          {copyMutation.isError && (
            <p className="text-sm text-rose-600" role="alert">
              No se han podido copiar: {getErrorMessage(copyMutation.error)}
            </p>
          )}
        </div>
      ) : (
        <>
          <BudgetSummary budgets={budgets} />

          {/* grid-cols-1 is minmax(0, 1fr): without it a long category name could overflow on mobile */}
          <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {budgets.map((budget) => (
              <li key={budget.id}>
                <BudgetListItem
                  budget={budget}
                  onEdit={(selected) => setFormState({ kind: 'edit', budget: selected })}
                  onDelete={setBudgetToDelete}
                />
              </li>
            ))}
          </ul>

          {categoriesQuery.isSuccess && availableCategories.length === 0 && (
            <p className="text-center text-sm text-slate-500">Todas tus categorías de gasto tienen presupuesto este mes.</p>
          )}
        </>
      )}

      <p className="text-sm text-slate-500">
        Solo cuentan los gastos confirmados. Los pendientes de confirmar se suman cuando los confirmas.
      </p>

      {/* Mounted only while open, so each opening starts clean */}
      {formState !== null && (
        <BudgetFormModal
          budget={formState.kind === 'edit' ? formState.budget : undefined}
          month={month}
          availableCategories={availableCategories}
          onClose={() => setFormState(null)}
        />
      )}

      {budgetToDelete && <DeleteBudgetDialog budget={budgetToDelete} onClose={() => setBudgetToDelete(null)} />}
    </section>
  )
}

export default BudgetsPage
