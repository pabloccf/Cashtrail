import { useState } from 'react'
import ErrorState from '../../components/ErrorState'
import ListSkeleton from '../../components/ListSkeleton'
import { useRecurring } from '../../hooks/useRecurring'
import { useToggleRecurring } from '../../hooks/useRecurringMutations'
import type { TransactionType } from '../../types/transaction'
import type { RecurringTransaction } from '../../types/recurring'
import { getErrorMessage } from '../../utils/errorMessage'
import { getAnnualTotals } from '../../utils/recurring'
import AnnualSummary from './AnnualSummary'
import DeleteRecurringDialog from './DeleteRecurringDialog'
import RecurringFormModal from './RecurringFormModal'
import RecurringListItem from './RecurringListItem'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { Plus, Repeat } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

const sections: { type: TransactionType; title: string; emptyText: string; emptyHint: string; addLabel: string }[] = [
  {
    type: 'EXPENSE',
    title: 'Gastos fijos',
    emptyText: 'No tienes gastos fijos',
    emptyHint: 'El alquiler, Spotify o el préstamo del coche: apúntalos una vez y se registran solos cada mes.',
    addLabel: 'Añadir gasto fijo',
  },
  {
    type: 'INCOME',
    title: 'Ingresos fijos',
    emptyText: 'No tienes ingresos fijos',
    emptyHint: 'Tu nómina u otros ingresos que llegan siempre el mismo día.',
    addLabel: 'Añadir ingreso fijo',
  },
]

// Same pattern as CategoriesPage: null is closed, `kind` tells creating from editing
type FormState = null | { kind: 'new'; type: TransactionType } | { kind: 'edit'; recurring: RecurringTransaction }

function RecurringPage() {
  const { data: recurringList, isPending, isError, error, refetch } = useRecurring()
  const toggleMutation = useToggleRecurring()
  const toast = useToast()
  const [formState, setFormState] = useState<FormState>(null)
  const [recurringToDelete, setRecurringToDelete] = useState<RecurringTransaction | null>(null)

  function openEdit(recurring: RecurringTransaction) {
    setFormState({ kind: 'edit', recurring })
  }

  function toggle(recurring: RecurringTransaction) {
    toggleMutation.mutate(recurring.id, {
      // `recurring` is the state before the change: if it was active, it is now paused
      onSuccess: () => toast.success(recurring.active ? 'Fijo pausado' : 'Fijo reactivado'),
    })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Gastos e ingresos fijos</h1>

      {isPending ? (
        <ListSkeleton label="Cargando fijos…" />
      ) : isError ? (
        <ErrorState
          message="No se han podido cargar los gastos e ingresos fijos."
          error={error}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {recurringList.some((recurring) => recurring.active) && (
            <AnnualSummary totals={getAnnualTotals(recurringList)} />
          )}

          {toggleMutation.isError && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              No se ha podido cambiar el estado: {getErrorMessage(toggleMutation.error)}
            </p>
          )}

          {sections.map((section) => {
            // The backend already returns them sorted: active first, then by description
            const sectionItems = recurringList.filter((recurring) => recurring.type === section.type)
            const headingId = `recurring-${section.type}`

            return (
              <section key={section.type} aria-labelledby={headingId} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <h2 id={headingId} className="text-lg font-semibold">
                    {section.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setFormState({ kind: 'new', type: section.type })}
                    className="min-h-11 rounded-lg px-3 font-medium text-brand-700 hover:bg-brand-50"
                  >
                    + Añadir
                  </button>
                </div>

                {sectionItems.length === 0 ? (
                  <EmptyState icon={Repeat} title={section.emptyText} description={section.emptyHint}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setFormState({ kind: 'new', type: section.type })}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      {section.addLabel}
                    </Button>
                  </EmptyState>
                ) : (
                  // grid-cols-1 is minmax(0, 1fr): without it the column grows to fit the longest
                  // untruncated text and the cards overflow the screen on mobile
                  <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {sectionItems.map((recurring) => (
                      <li key={recurring.id}>
                        <RecurringListItem
                          recurring={recurring}
                          // `variables` is the id passed to mutate(): only that row is disabled
                          isToggling={toggleMutation.isPending && toggleMutation.variables === recurring.id}
                          onEdit={openEdit}
                          onToggle={toggle}
                          onDelete={setRecurringToDelete}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </>
      )}

      {/* Mounted only while open, so each opening starts clean */}
      {formState !== null && (
        <RecurringFormModal
          recurring={formState.kind === 'edit' ? formState.recurring : undefined}
          defaultType={formState.kind === 'edit' ? formState.recurring.type : formState.type}
          onClose={() => setFormState(null)}
        />
      )}

      {recurringToDelete && (
        <DeleteRecurringDialog recurring={recurringToDelete} onClose={() => setRecurringToDelete(null)} />
      )}
    </section>
  )
}

export default RecurringPage
