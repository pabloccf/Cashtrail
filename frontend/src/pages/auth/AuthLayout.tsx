import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

// Shared frame of /login and /register: logo, a centered card and a link to the other page
function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12 text-slate-900 md:justify-center">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center text-3xl font-bold text-emerald-600">Cashtrail</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold">{title}</h1>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </main>
  )
}

export default AuthLayout
