import { useState } from 'react'
import ErrorState from '../../components/ErrorState'
import ListSkeleton from '../../components/ListSkeleton'
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
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { PiggyBank } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

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
  const toast = useToast()
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
      className="min-h-11 rounded-lg px-3 font-medium text-brand-700 hover:bg-brand-50 disabled:text-slate-400 disabled:hover:bg-transparent"
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
        <ListSkeleton label="Cargando presupuestos…" />
      ) : isError ? (
        <ErrorState message="No se han podido cargar los presupuestos." error={error} onRetry={() => refetch()} />
      ) : budgets.length === 0 ? (
        // Each month starts empty, so the empty state offers to bring last month's budgets
        <EmptyState
          icon={PiggyBank}
          title={`No tienes presupuestos para ${formatMonth(month).toLowerCase()}`}
          description="Cada mes empieza vacío. Trae los del mes anterior o crea uno nuevo con «+ Añadir»."
        >
          <Button
            onClick={() =>
              copyMutation.mutate(month, {
                // Copying nothing is not a success worth a toast: the inline message below explains it
                onSuccess: ({ copied }) => {
                  if (copied > 0) toast.success(copied === 1 ? '1 presupuesto copiado' : `${copied} presupuestos copiados`)
                },
              })
            }
            disabled={copyMutation.isPending}
          >
            {copyMutation.isPending ? 'Copiando…' : `Copiar los de ${formatMonth(shiftMonth(month, -1)).toLowerCase()}`}
          </Button>
          {copiedNothing && (
            <p className="w-full text-sm text-slate-500" role="status">
              {formatMonth(shiftMonth(month, -1))} no tiene presupuestos. Crea uno con «+ Añadir».
            </p>
          )}
          {copyMutation.isError && (
            <p className="w-full text-sm text-rose-600" role="alert">
              No se han podido copiar: {getErrorMessage(copyMutation.error)}
            </p>
          )}
        </EmptyState>
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
