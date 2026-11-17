import type { ReactNode } from 'react'
import Card from '../../components/Card'

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
        <p className="mb-8 text-center text-3xl font-bold text-brand-600">Cashtrail</p>
        <Card padding="lg">
          <h1 className="mb-6 text-xl font-bold">{title}</h1>
          {children}
        </Card>
        <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </main>
  )
}

export default AuthLayout
