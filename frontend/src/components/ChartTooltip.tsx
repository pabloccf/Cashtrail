import type { ReactNode } from 'react'

interface ChartTooltipProps {
  title: string
  children: ReactNode
}

// Frame of the charts' tooltips: same surface as the cards, raised with a stronger shadow
function ChartTooltip({ title, children }: ChartTooltipProps) {
  return (
    <div className="min-w-40 rounded-xl bg-white px-3 py-2.5 text-sm shadow-elevated ring-1 ring-slate-900/5">
      <p className="mb-1.5 text-xs font-medium text-slate-500">{title}</p>
      {children}
    </div>
  )
}

export default ChartTooltip
