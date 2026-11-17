import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import Card from './Card'

// Full class names (not built from strings), so Tailwind can find them when it generates the CSS
const toneClasses = {
  positive: { amount: 'text-emerald-600', icon: 'bg-emerald-50 text-emerald-600' },
  negative: { amount: 'text-rose-600', icon: 'bg-rose-50 text-rose-600' },
  neutral: { amount: 'text-slate-900', icon: 'bg-brand-50 text-brand-600' },
} as const

export type StatTone = keyof typeof toneClasses

interface StatCardProps {
  label: string
  amount: number // In cents
  tone: StatTone
  icon: LucideIcon
  // Optional small text under the amount (an explanation or a breakdown)
  children?: ReactNode
}

// A single figure: an icon in a tinted circle, a label and a big amount
function StatCard({ label, amount, tone, icon: Icon, children }: StatCardProps) {
  const { formatMoney } = useMoney()
  const classes = toneClasses[tone]
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      {/* Proportional digits: a standalone figure, not a column that has to line up */}
      <p className={`mt-3 text-2xl font-bold tracking-tight md:text-3xl ${classes.amount}`}>{formatMoney(amount)}</p>
      {children && <div className="mt-2 text-xs text-slate-500">{children}</div>}
    </Card>
  )
}

export default StatCard
