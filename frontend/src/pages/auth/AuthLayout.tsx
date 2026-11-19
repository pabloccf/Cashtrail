import type { ReactNode } from 'react'
import { ArrowLeftRight, PiggyBank, Repeat, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import BrandLogo from '../../components/BrandLogo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

// What the app does, with the same icons as the navigation, so they are familiar once inside
const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ArrowLeftRight, title: 'Apunta tus gastos e ingresos', text: 'Por categorías, con búsqueda y filtros.' },
  { icon: Repeat, title: 'Los fijos se apuntan solos', text: 'El alquiler, la nómina o Spotify, cada mes.' },
  { icon: PiggyBank, title: 'Presupuestos y estadísticas', text: 'Mira en qué se va el dinero y cuánto te queda.' },
]

// Shared frame of /login and /register.
// Desktop (lg): split screen, a brand panel on the left and the form on the right.
// Mobile: only the form, with the logo above it (the panel would push the form below the fold)
function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-white text-slate-900">
      {/* Brand panel. Decorative and informative only: everything needed to log in is in the form */}
      <aside className="relative hidden w-[44%] max-w-xl shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white lg:flex xl:p-12">
        {/* Same decorative circles as the balance hero of the dashboard */}
        <span className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10" aria-hidden="true" />
        <span className="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5" aria-hidden="true" />

        <div className="relative">
          <BrandLogo tone="inverted" />
        </div>

        <div className="relative">
          <p className="max-w-md text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
            Controla en qué se va tu dinero, sin complicaciones.
          </p>
          <ul className="mt-10 flex flex-col gap-6">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"
                  aria-hidden="true"
                >
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-brand-100">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* The key principle of the app: it only keeps records, it never touches real money */}
        <p className="relative flex items-center gap-2 text-sm text-brand-100">
          <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
          Solo registro y control: nunca mueve dinero ni se conecta a tu banco.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 lg:justify-center lg:py-12">
        <div className="w-full max-w-sm">
          {/* On desktop the logo is already in the panel */}
          <div className="mb-10 lg:hidden">
            <BrandLogo />
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-slate-600">{footer}</p>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link to="/privacy" className="underline-offset-2 hover:text-slate-700 hover:underline">
              Política de privacidad
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
