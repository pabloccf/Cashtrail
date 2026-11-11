import CategoryIcon from '../../components/CategoryIcon'
import TrashIcon from '../../components/TrashIcon'
import type { Category } from '../../types/category'

interface CategoryListItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

// Same structure as TransactionCard: tapping the row edits, the trash icon deletes
function CategoryListItem({ category, onEdit, onDelete }: CategoryListItemProps) {
  return (
    <div className="flex items-stretch rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onEdit(category)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-l-xl p-3 text-left hover:bg-slate-50 active:bg-slate-50"
      >
        <CategoryIcon icon={category.icon} color={category.color} />
        <span className="truncate font-medium">{category.name}</span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(category)}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-xl border-l border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-50 active:text-rose-600"
        aria-label={`Eliminar categoría ${category.name}`}
      >
        <TrashIcon className="size-5" />
      </button>
    </div>
  )
}

export default CategoryListItem
