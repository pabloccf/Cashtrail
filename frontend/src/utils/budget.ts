// From this share of the budget on, the bar turns amber as a warning
const WARNING_RATIO = 0.8

// ok: below 80 %. warning: from 80 % up to the limit (included). over: spent more than the limit
export type BudgetLevel = 'ok' | 'warning' | 'over'

export interface BudgetProgress {
  percent: number // Whole percentage for the text. Can be above 100
  barPercent: number // Width of the bar, 0-100: a budget spent twice still fills it only once
  level: BudgetLevel
  remaining: number // In cents. Negative when the budget has been exceeded
}

// `amount` is always positive (the backend requires it), so there is no division by zero
export function getBudgetProgress(spent: number, amount: number): BudgetProgress {
  const ratio = spent / amount
  return {
    // floor, not round: 99.6 % shows "99 %", never "100 %" while there is still something left
    percent: Math.floor(ratio * 100),
    barPercent: Math.min(ratio * 100, 100),
    level: spent > amount ? 'over' : ratio >= WARNING_RATIO ? 'warning' : 'ok',
    remaining: amount - spent,
  }
}
