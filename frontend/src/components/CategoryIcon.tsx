import { getCategoryIcon } from '../utils/categoryIcons'

// Circle size and icon size for each variant. Full class names (not built with `size-${n}`),
// so Tailwind can find them in the code when it generates the CSS
const sizeClasses = {
  sm: { circle: 'size-6', icon: 'size-3.5' },
  md: { circle: 'size-10', icon: 'size-5' },
} as const

interface CategoryIconProps {
  icon: string
  color: string
  size?: keyof typeof sizeClasses
}

// White icon inside a circle of the category color. The color comes from the database,
// so it goes in `style` (Tailwind cannot generate classes for values it does not know at build time)
function CategoryIcon({ icon, color, size = 'md' }: CategoryIconProps) {
  const Icon = getCategoryIcon(icon)
  const classes = sizeClasses[size]

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-white ${classes.circle}`}
      style={{ backgroundColor: color }}
      // Decorative: the category name is always shown next to it
      aria-hidden="true"
    >
      {/* The rule cannot see that getCategoryIcon only looks up an existing component in a
          module-level Map (it never creates a new one), so the same name always gives the same component */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className={classes.icon} />
    </span>
  )
}

export default CategoryIcon
