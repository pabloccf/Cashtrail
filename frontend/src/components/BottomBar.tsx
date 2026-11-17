import { NavLink } from 'react-router'
import type { NavItem } from '../types/navigation'

interface BottomBarProps {
  items: NavItem[]
}

// Mobile navigation, fixed at the bottom. Translucent with a blur, so the content shows faintly
// behind it while scrolling. The active section gets a pill behind its icon.
// min-w-0 lets each item shrink below the width of its label instead of overflowing the bar
function BottomBar({ items }: BottomBarProps) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-slate-900/5 bg-white/85 px-2 pt-1.5 pb-2 backdrop-blur-lg md:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium"
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-500'
                }`}
              >
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
              </span>
              <span className={`max-w-full truncate ${isActive ? 'font-semibold text-brand-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomBar
