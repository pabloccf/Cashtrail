import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { formatMonth } from '../utils/month'

interface BalanceHeroProps {
  month: string // "YYYY-MM"
  // In cents. Balance = income − expense, can be negative
  balance: number
  income: number
  expense: number
}

interface FlowProps {
  label: string
  amount: number
  icon: LucideIcon
}

// Income or expenses inside the hero. White on the gradient: the label and the arrow say which one
// it is, so it does not depend on green and red (which would also have poor contrast on indigo)
function Flow({ label, amount, icon: Icon }: FlowProps) {
  const { formatMoney } = useMoney()
  return (
    <div className="min-w-0 rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className="flex items-center gap-1.5 text-xs font-medium text-brand-100">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-lg font-semibold">{formatMoney(amount)}</p>
    </div>
  )
}

// The figure the dashboard leads with: the balance of the month, big, on the brand gradient.
// Receives the data by props, so the shared dashboard (phase 8) can reuse it
function BalanceHero({ month, balance, income, expense }: BalanceHeroProps) {
  const { formatMoney } = useMoney()
  return (
    <section
      aria-labelledby="balance-hero-title"
      // overflow-hidden clips the decorative circles to the rounded corners
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-5 text-white shadow-elevated md:p-6"
    >
      {/* Two translucent circles in the corner: decoration only, they give the flat gradient some depth */}
      <span className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" aria-hidden="true" />
      <span className="absolute -right-4 -bottom-20 size-40 rounded-full bg-white/5" aria-hidden="true" />

      {/* relative: puts the content above the circles (positioned elements paint over static ones) */}
      <div className="relative">
        <h2 id="balance-hero-title" className="text-sm font-medium text-brand-100">
          Balance de {formatMonth(month).toLowerCase()}
        </h2>
        {/* Proportional digits (no tabular-nums): equal-width digits look loose at this size */}
        <p className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">{formatMoney(balance)}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Flow label="Ingresos" amount={income} icon={ArrowDownLeft} />
          <Flow label="Gastos" amount={expense} icon={ArrowUpRight} />
        </div>
      </div>
    </section>
  )
}

export default BalanceHero
