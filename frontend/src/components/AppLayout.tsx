import { useState, ViewTransition } from 'react'
import { ArrowLeftRight, LayoutDashboard, LogOut, PiggyBank, Repeat, Settings, Tags } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router'
import { useCurrentUser, useLogout } from '../hooks/useAuth'
import type { NavItem } from '../types/navigation'
import { loadSidebarCollapsed, saveSidebarCollapsed } from '../utils/sidebar'
import BottomBar from './BottomBar'
import BrandLogo from './BrandLogo'
import Sidebar from './Sidebar'

// New sections are added here as the phases go on. Before adding one to the bottom bar
// (inBottomBar: true), check that every label still fits in a 360px-wide screen
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, inBottomBar: true },
  { to: '/transactions', label: 'Transacciones', icon: ArrowLeftRight, inBottomBar: true },
  { to: '/recurring', label: 'Fijos', icon: Repeat, inBottomBar: true },
  { to: '/budgets', label: 'Presupuestos', icon: PiggyBank, inBottomBar: true },
  { to: '/categories', label: 'Categorías', icon: Tags, inBottomBar: false },
  { to: '/settings', label: 'Ajustes', icon: Settings, inBottomBar: false },
]

const bottomBarItems = navItems.filter((item) => item.inBottomBar)

const topBarButtonClass = 'flex size-11 items-center justify-center rounded-xl disabled:opacity-60'

function AppLayout() {
  // ProtectedRoute already loaded the user, so this reads it from the cache without a new request
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()
  const { pathname } = useLocation()
  // On mobile, Categorías is opened from Ajustes, so the settings icon stays highlighted there too
  const isInCategories = useMatch('/categories') !== null
  // Function passed to useState: localStorage is read only on the first render
  const [sidebarCollapsed, setSidebarCollapsed] = useState(loadSidebarCollapsed)

  function toggleSidebar() {
    const collapsed = !sidebarCollapsed
    setSidebarCollapsed(collapsed)
    saveSidebarCollapsed(collapsed)
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 md:flex">
      <Sidebar
        items={navItems}
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onLogout={() => logoutMutation.mutate()}
        isLoggingOut={logoutMutation.isPending}
      />

      {/* Mobile: top bar. Sticky and translucent, like the bottom bar.
          Fixed height (h-14): the day headings of the transactions list stick right under it (top-14) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-900/5 bg-white/85 pr-2 pl-4 backdrop-blur-lg md:hidden">
        {/* Same as in the sidebar: the logo goes to the home page */}
        <Link to="/dashboard" aria-label="Cashtrail, ir a Inicio" className="flex min-h-11 items-center rounded-xl">
          <BrandLogo />
        </Link>
        <div className="flex items-center">
          <NavLink
            to="/settings"
            aria-label="Ajustes"
            className={({ isActive }) =>
              `${topBarButtonClass} ${isActive || isInCategories ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100'}`
            }
          >
            <Settings className="size-5" aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={`${topBarButtonClass} text-slate-500 hover:bg-slate-100`}
            aria-label={logoutMutation.isPending ? 'Saliendo…' : 'Cerrar sesión'}
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* min-w-0: without it, a wide child (a table, a chart) would stretch this flex item past the screen.
          Bottom padding on mobile so the fixed bottom bar never covers the content */}
      <main className="min-w-0 flex-1 px-4 pt-4 pb-28 md:px-8 md:pt-8 md:pb-10">
        {/* Page transition: React animates what is inside when it changes in a transition, and
            React Router makes every navigation one. The key gives each page its own boundary, so a new
            page is an "exit" of the old one plus an "enter" of the new one (a cross-fade).
            default="none": changes within the same page (filters, month, page number, which also go
            through the URL) are "updates" and are not animated, so typing in the search box never fades */}
        <ViewTransition key={pathname} default="none" enter="page-enter" exit="page-exit">
          <div>
            <Outlet />
          </div>
        </ViewTransition>
      </main>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}

export default AppLayout
