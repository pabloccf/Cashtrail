import type { TransactionCategory } from '../types/transaction'

interface CategoryBadgeProps {
  category: TransactionCategory
}

// Colored dot + name. The color comes from the database, so it goes in `style`:
// Tailwind only generates classes it can see in the code at build time
function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />
      {category.name}
    </span>
  )
}

export default CategoryBadge
