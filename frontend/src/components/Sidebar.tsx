import { LogOut, Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import type { NavItem } from '../types/navigation'
import type { User } from '../types/user'
import BrandLogo from './BrandLogo'
import UserAvatar from './UserAvatar'

interface SidebarProps {
  items: NavItem[]
  // null/undefined only for an instant: the sidebar lives inside ProtectedRoute, which waits for the user
  user: User | null | undefined
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
  isLoggingOut: boolean
}

// Name of a button or link while the sidebar is collapsed. It shows on hover and on keyboard focus.
// aria-hidden: screen readers already get the name from the hidden label (or the aria-label)
function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  )
}

// Square, icon-only button
const iconButtonClass =
  'group relative flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60'

// Desktop navigation. Expanded: icon and label. Collapsed: only the icons, with the label in a tooltip.
// `sticky top-0 h-dvh` keeps it on screen while the page scrolls, with the user block always at the bottom
function Sidebar({ items, user, collapsed, onToggle, onLogout, isLoggingOut }: SidebarProps) {
  return (
    <aside
      // z-40: `sticky` creates its own stacking context, so the tooltips' z-50 only counts inside the
      // sidebar. The sidebar itself has to be above the content for the tooltips not to be covered
      className={`sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-slate-900/5 bg-white py-4 transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex ${collapsed ? 'w-19 px-3.5' : 'w-64 px-4'}`}
    >
      {/* The "hamburger" (three lines) folds and unfolds the sidebar, like in Gmail or YouTube.
          Its icon is centered over the section icons below, so nothing moves sideways when it toggles.
          Collapsed, only the hamburger stays: the logo does not fit next to it */}
      <div className={`mb-8 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
        <button
          type="button"
          onClick={onToggle}
          className={iconButtonClass}
          aria-label={collapsed ? 'Expandir menú' : 'Plegar menú'}
        >
          <Menu className="size-5" aria-hidden="true" />
          {collapsed && <Tooltip label="Expandir menú" />}
        </button>
        {!collapsed && (
          // The logo goes to the home page, as on most websites. The aria-label keeps the visible
          // name ("Cashtrail") and says where the link goes
          <Link to="/dashboard" aria-label="Cashtrail, ir a Inicio" className="rounded-xl">
            <BrandLogo />
          </Link>
        )}
      </div>

      <nav aria-label="Principal" className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex min-h-11 items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : 'px-3'
              } ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
            }
          >
            {({ isActive }) => (
              <>
                {/* Small bar on the left edge of the active section, a second cue besides the color */}
                {/* Sits on the edge of the sidebar: the offset is its horizontal padding (px-3.5 or px-4) */}
                {isActive && (
                  <span
                    className={`absolute inset-y-2 w-1 rounded-r-full bg-brand-600 ${collapsed ? '-left-3.5' : '-left-4'}`}
                    aria-hidden="true"
                  />
                )}
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                {/* Collapsed, the label is only hidden visually, so the link keeps its accessible name */}
                <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                {collapsed && <Tooltip label={item.label} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* mt-auto pushes this block to the bottom */}
      <div className="mt-auto border-t border-slate-900/5 pt-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : 'px-1'}`}>
          {user && <UserAvatar name={user.name} />}
          {!collapsed && user && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className={iconButtonClass}
            aria-label={isLoggingOut ? 'Saliendo…' : 'Cerrar sesión'}
          >
            <LogOut className="size-5" aria-hidden="true" />
            <Tooltip label="Cerrar sesión" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
