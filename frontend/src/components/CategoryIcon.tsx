import { getCategoryIcon } from '../utils/categoryIcons'

interface CategoryIconProps {
  icon: string
  color: string
}

// White icon inside a circle of the category color. The color comes from the database,
// so it goes in `style` (Tailwind cannot generate classes for values it does not know at build time)
function CategoryIcon({ icon, color }: CategoryIconProps) {
  const Icon = getCategoryIcon(icon)

  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
      // Decorative: the category name is always shown next to it
      aria-hidden="true"
    >
      {/* The rule cannot see that getCategoryIcon only looks up an existing component in a
          module-level Map (it never creates a new one), so the same name always gives the same component */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className="size-5" />
    </span>
  )
}

export default CategoryIcon
