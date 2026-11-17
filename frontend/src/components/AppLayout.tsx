import { ArrowLeftRight, LayoutDashboard, PiggyBank, Repeat, Settings, Tags, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useMatch } from 'react-router'
import { useCurrentUser, useLogout } from '../hooks/useAuth'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  // false: only in the desktop sidebar. The mobile bottom bar keeps the sections used every day,
  // so each label has room. Categorías is reached from Ajustes, and Ajustes from the top bar
  inBottomBar: boolean
}

// New sections are added here as the phases go on
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, inBottomBar: true },
  { to: '/transactions', label: 'Transacciones', icon: ArrowLeftRight, inBottomBar: true },
  { to: '/recurring', label: 'Fijos', icon: Repeat, inBottomBar: true },
  { to: '/budgets', label: 'Presupuestos', icon: PiggyBank, inBottomBar: true },
  { to: '/categories', label: 'Categorías', icon: Tags, inBottomBar: false },
  { to: '/settings', label: 'Ajustes', icon: Settings, inBottomBar: false },
]

const bottomBarItems = navItems.filter((item) => item.inBottomBar)

// NavLink passes `isActive`, so the current section can be highlighted
function activeClass(isActive: boolean) {
  return isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
}

// Desktop sidebar: icon and label in a row
function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${activeClass(isActive)}`
}

// Mobile bottom bar: icon with a small label under it, so four sections fit in a narrow screen.
// min-w-0 lets each item shrink below the width of its label instead of overflowing the bar
function bottomLinkClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium ${activeClass(isActive)}`
}

function AppLayout() {
  // ProtectedRoute already loaded the user, so this reads it from the cache without a new request
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()
  // On mobile, Categorías is opened from Ajustes, so the settings icon stays highlighted there too
  const isInCategories = useMatch('/categories') !== null

  const logoutButton = (
    <button
      type="button"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
    >
      {logoutMutation.isPending ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Desktop: sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <p className="mb-6 px-3 text-xl font-bold text-emerald-600">Cashtrail</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={sidebarLinkClass}>
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/* mt-auto pushes the user block to the bottom of the sidebar */}
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 pt-4">
          <p className="truncate px-3 text-sm text-slate-500">{user?.name}</p>
          <div className="flex">{logoutButton}</div>
        </div>
      </aside>

      {/* Mobile: top bar with the logo, the settings icon and the logout button */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-1 md:hidden">
        <p className="text-lg font-bold text-emerald-600">Cashtrail</p>
        <div className="flex items-center gap-1">
          <NavLink
            to="/settings"
            aria-label="Ajustes"
            className={({ isActive }) =>
              `flex size-11 items-center justify-center rounded-lg ${activeClass(isActive || isInCategories)}`
            }
          >
            <Settings className="size-5" aria-hidden="true" />
          </NavLink>
          {logoutButton}
        </div>
      </header>

      {/* Bottom padding on mobile so the fixed bottom bar never covers the content */}
      <main className="flex-1 px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile: bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 flex gap-1 border-t border-slate-200 bg-white p-2 md:hidden">
        {bottomBarItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={bottomLinkClass}>
            <item.icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppLayout
