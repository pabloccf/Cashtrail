import { useId, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import SearchInput from '../../components/SearchInput'
import { useCategories } from '../../hooks/useCategories'
import type { Category } from '../../types/category'
import {
  countPanelFilters,
  hasActiveFilters,
  type TransactionFilters as Filters,
} from '../../utils/transactionFilters'
import Card from '../../components/Card'

// `undefined` removes the filter
export type FilterChanges = Partial<Record<keyof Filters, string | undefined>>

interface TransactionFiltersProps {
  filters: Filters
  onChange: (changes: FilterChanges) => void
  onClear: () => void
}

const selectClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base ' +
  'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

const labelClass = 'mb-1 block text-sm font-medium text-slate-600'

function CategoryOptions({ categories }: { categories: Category[] }) {
  return categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ))
}

function TransactionFilters({ filters, onChange, onClear }: TransactionFiltersProps) {
  // Only matters on mobile: on desktop the panel is always visible (md:grid)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { data: categories = [] } = useCategories()
  const id = useId()
  const panelId = `${id}-panel`

  const panelFilterCount = countPanelFilters(filters)
  const expenseCategories = categories.filter((category) => category.type === 'EXPENSE')
  const incomeCategories = categories.filter((category) => category.type === 'INCOME')

  function handleTypeChange(type: string) {
    // A category of the other type would give an always-empty list, so it is removed
    const selectedCategory = categories.find((category) => category.id === filters.category)
    const keepCategory = !type || selectedCategory?.type === type
    onChange({ type: type || undefined, category: keepCategory ? filters.category : undefined })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={filters.q ?? ''}
            onDebouncedChange={(q) => onChange({ q: q.trim() || undefined })}
            label="Buscar en la descripción"
            placeholder="Buscar…"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsPanelOpen((open) => !open)}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-700 hover:bg-slate-50 md:hidden"
          aria-expanded={isPanelOpen}
          aria-controls={panelId}
        >
          <SlidersHorizontal className="size-5" aria-hidden="true" />
          Filtros
          {panelFilterCount > 0 && (
            <span className="rounded-full bg-brand-600 px-2 text-xs text-white">{panelFilterCount}</span>
          )}
        </button>
      </div>

      <Card
        id={panelId}
        className={`${isPanelOpen ? 'grid' : 'hidden'} gap-3 sm:grid-cols-2 md:grid md:grid-cols-3 lg:grid-cols-5`}
      >
        <div>
          <label htmlFor={`${id}-type`} className={labelClass}>
            Tipo
          </label>
          <select
            id={`${id}-type`}
            className={selectClass}
            value={filters.type ?? ''}
            onChange={(event) => handleTypeChange(event.target.value)}
          >
            <option value="">Todos</option>
            <option value="EXPENSE">Gastos</option>
            <option value="INCOME">Ingresos</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-status`} className={labelClass}>
            Estado
          </label>
          <select
            id={`${id}-status`}
            className={selectClass}
            value={filters.status ?? ''}
            onChange={(event) => onChange({ status: event.target.value || undefined })}
          >
            <option value="">Todos</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="PENDING">Pendientes</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-category`} className={labelClass}>
            Categoría
          </label>
          <select
            id={`${id}-category`}
            className={selectClass}
            value={filters.category ?? ''}
            onChange={(event) => onChange({ category: event.target.value || undefined })}
          >
            <option value="">Todas</option>
            {/* With a type selected only its categories are offered; otherwise both, grouped */}
            {filters.type === 'EXPENSE' ? (
              <CategoryOptions categories={expenseCategories} />
            ) : filters.type === 'INCOME' ? (
              <CategoryOptions categories={incomeCategories} />
            ) : (
              <>
                <optgroup label="Gastos">
                  <CategoryOptions categories={expenseCategories} />
                </optgroup>
                <optgroup label="Ingresos">
                  <CategoryOptions categories={incomeCategories} />
                </optgroup>
              </>
            )}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-from`} className={labelClass}>
            Desde
          </label>
          {/* min/max stop the calendar from picking a range that ends before it starts */}
          <input
            id={`${id}-from`}
            type="date"
            className={selectClass}
            value={filters.from ?? ''}
            max={filters.to}
            onChange={(event) => onChange({ from: event.target.value || undefined })}
          />
        </div>

        <div>
          <label htmlFor={`${id}-to`} className={labelClass}>
            Hasta
          </label>
          <input
            id={`${id}-to`}
            type="date"
            className={selectClass}
            value={filters.to ?? ''}
            min={filters.from}
            onChange={(event) => onChange({ to: event.target.value || undefined })}
          />
        </div>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 justify-self-start rounded-lg px-3 font-medium text-brand-700 hover:bg-brand-50 sm:col-span-2 md:col-span-3 lg:col-span-5"
          >
            Limpiar filtros
          </button>
        )}
      </Card>
    </div>
  )
}

export default TransactionFilters
