import type { ReactNode } from 'react'
import { useMoney } from '../hooks/useMoney'

// Full class names (not built from strings), so Tailwind can find them when it generates the CSS
const toneClasses = {
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
  neutral: 'text-slate-900',
} as const

export type StatTone = keyof typeof toneClasses

interface StatCardProps {
  label: string
  amount: number // In cents
  tone: StatTone
  // Optional small text under the amount (an explanation or a breakdown)
  children?: ReactNode
}

// A single figure of the dashboard: a label and a big amount
function StatCard({ label, amount, tone, children }: StatCardProps) {
  const { formatMoney } = useMoney()
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      {/* tabular-nums: all digits have the same width, so the amounts of the cards line up */}
      <p className={`mt-1 text-xl font-bold tabular-nums md:text-2xl ${toneClasses[tone]}`}>{formatMoney(amount)}</p>
      {children && <div className="mt-2 text-xs text-slate-500">{children}</div>}
    </div>
  )
}

export default StatCard
