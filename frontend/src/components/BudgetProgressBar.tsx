import { getBudgetProgress, type BudgetLevel } from '../utils/budget'

// Full class names (not built from the level), so Tailwind can find them when it generates the CSS
const barColors: Record<BudgetLevel, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-rose-500',
}

interface BudgetProgressBarProps {
  spent: number // In cents
  amount: number // In cents
  // What the bar measures, for screen readers: "Supermercado", "Total del mes"...
  label: string
}

// Gets its data by props, so it can be reused anywhere (the shared budgets of Phase 8 too)
function BudgetProgressBar({ spent, amount, label }: BudgetProgressBarProps) {
  const { percent, barPercent, level } = getBudgetProgress(spent, amount)

  return (
    // role="progressbar" + aria-value*: screen readers announce "Supermercado, 85 %".
    // aria-valuenow is capped at 100 because it cannot be above aria-valuemax; the text says the real one
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(percent, 100)}
      aria-valuetext={`${percent} %`}
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
    >
      {/* The width depends on data, so it goes in `style` (same reason as the category colors) */}
      <div
        className={`h-full rounded-full transition-[width] ${barColors[level]}`}
        style={{ width: `${barPercent}%` }}
      />
    </div>
  )
}

export default BudgetProgressBar
