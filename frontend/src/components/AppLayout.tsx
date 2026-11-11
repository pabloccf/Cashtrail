import { NavLink, Outlet } from 'react-router'

interface NavItem {
  to: string
  label: string
}

// New sections (dashboard, categories...) are added here as the phases go on
const navItems: NavItem[] = [{ to: '/transactions', label: 'Transacciones' }]

// NavLink passes `isActive`, so the current section can be highlighted
function navLinkClass({ isActive }: { isActive: boolean }) {
  const base = 'flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-medium md:justify-start'
  return isActive
    ? `${base} bg-emerald-50 text-emerald-700`
    : `${base} text-slate-600 hover:bg-slate-100`
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Desktop: sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <p className="mb-6 px-3 text-xl font-bold text-emerald-600">Cashtrail</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Bottom padding on mobile so the fixed bottom bar never covers the content */}
      <main className="flex-1 px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile: bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 flex gap-1 border-t border-slate-200 bg-white p-2 md:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={(state) => `flex-1 ${navLinkClass(state)}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppLayout
