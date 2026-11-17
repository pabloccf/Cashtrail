import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import type { Category } from '../../types/category'
import type { TransactionType } from '../../types/transaction'
import { getErrorMessage } from '../../utils/errorMessage'
import CategoryFormModal from './CategoryFormModal'
import CategoryListItem from './CategoryListItem'
import DeleteCategoryDialog from './DeleteCategoryDialog'

const sections: { type: TransactionType; title: string }[] = [
  { type: 'EXPENSE', title: 'Gastos' },
  { type: 'INCOME', title: 'Ingresos' },
]

// null: closed. `kind` tells creating from editing (a "discriminated union": TypeScript
// knows that `category` exists only when kind is 'edit')
type FormState =
  | null
  | { kind: 'new'; type: TransactionType }
  | { kind: 'edit'; category: Category }

function CategoriesPage() {
  const { data: categories, isPending, isError, error, refetch } = useCategories()
  const [formState, setFormState] = useState<FormState>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  function openEdit(category: Category) {
    setFormState({ kind: 'edit', category })
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Categorías</h1>

      {isPending ? (
        <p className="text-slate-500">Cargando categorías…</p>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-medium">No se han podido cargar las categorías.</p>
          <p className="text-sm">{getErrorMessage(error)}</p>
          <button type="button" className="mt-2 min-h-11 font-medium underline" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        sections.map((section) => {
          // The backend already returns them sorted by name
          const sectionCategories = categories.filter((category) => category.type === section.type)
          const headingId = `categories-${section.type}`

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

              {sectionCategories.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                  No tienes categorías de {section.title.toLowerCase()}.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionCategories.map((category) => (
                    <li key={category.id}>
                      <CategoryListItem category={category} onEdit={openEdit} onDelete={setCategoryToDelete} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })
      )}

      {/* Mounted only while open, so each opening starts clean (same as in TransactionsPage) */}
      {formState !== null && (
        <CategoryFormModal
          category={formState.kind === 'edit' ? formState.category : undefined}
          defaultType={formState.kind === 'edit' ? formState.category.type : formState.type}
          onClose={() => setFormState(null)}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryDialog category={categoryToDelete} onClose={() => setCategoryToDelete(null)} />
      )}
    </section>
  )
}

export default CategoriesPage
