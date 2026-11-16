import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
}

// White card with a title, the frame of each chart in the dashboard
function ChartCard({ title, children }: ChartCardProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default ChartCard
