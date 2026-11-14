import type { TransactionCategory } from '../types/transaction'
import type { Frequency, RecurringTransaction } from '../types/recurring'

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

// Days a month can have, counting February as 29 so the 29th can be chosen for leap years.
// In other years the backend uses the last day of the month (the 28th)
const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const

// `month` is 1-12
export function maxDaysInMonth(month: number): number {
  return MAX_DAYS_IN_MONTH[month - 1] ?? 31
}

interface Schedule {
  frequency: Frequency
  dayOfMonth: number
  monthOfYear: number | null
}

// "Cada mes, día 5" / "Cada año, 15 de marzo"
export function formatSchedule({ frequency, dayOfMonth, monthOfYear }: Schedule): string {
  if (frequency === 'YEARLY' && monthOfYear !== null) {
    return `Cada año, ${dayOfMonth} de ${MONTH_NAMES[monthOfYear - 1]}`
  }
  return `Cada mes, día ${dayOfMonth}`
}

// Annual pace in cents: monthly × 12, yearly × 1. It is not what will be recorded in the next
// 12 months (a loan ending in March still counts 12 payments), just how much it costs per year
function annualAmount(recurring: RecurringTransaction): number {
  return recurring.frequency === 'MONTHLY' ? recurring.amount * 12 : recurring.amount
}

export interface CategoryAnnualTotal {
  category: TransactionCategory
  total: number // In cents
}

export interface AnnualTotals {
  expense: number // In cents
  income: number // In cents
  expenseByCategory: CategoryAnnualTotal[] // Highest first
}

// Totals of the active recurring transactions. Paused ones do not count
export function getAnnualTotals(recurringList: RecurringTransaction[]): AnnualTotals {
  let expense = 0
  let income = 0
  // A Map keeps one entry per category id while adding up its recurring expenses
  const byCategory = new Map<string, CategoryAnnualTotal>()

  for (const recurring of recurringList) {
    if (!recurring.active) continue
    const amount = annualAmount(recurring)

    if (recurring.type === 'INCOME') {
      income += amount
      continue
    }

    expense += amount
    const entry = byCategory.get(recurring.categoryId)
    if (entry) {
      entry.total += amount
    } else {
      byCategory.set(recurring.categoryId, { category: recurring.category, total: amount })
    }
  }

  const expenseByCategory = [...byCategory.values()].sort((a, b) => b.total - a.total)
  return { expense, income, expenseByCategory }
}
