import type { TransactionCategory } from '../types/transaction'
import CategoryIcon from './CategoryIcon'

interface CategoryBadgeProps {
  category: TransactionCategory
}

// Small category icon + name, used in the transaction lists
function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <CategoryIcon icon={category.icon} color={category.color} size="sm" />
      {category.name}
    </span>
  )
}

export default CategoryBadge
