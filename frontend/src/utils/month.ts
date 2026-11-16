// A calendar month as "YYYY-MM" (e.g. "2026-11"). Like "YYYY-MM-DD", these strings sort
// the same way as the months they represent, and they are short and readable in the URL

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value)
}

function toMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function splitMonth(month: string): { year: number; month: number } {
  const [year, monthNumber] = month.split('-').map(Number)
  return { year, month: monthNumber }
}

// The current month in the user's local time zone (same reason as todayIsoDate in date.ts)
export function currentMonth(): string {
  const now = new Date()
  return toMonthString(now.getFullYear(), now.getMonth() + 1) // getMonth() is 0-based
}

// ("2026-01", -1) -> "2025-12". Date.UTC accepts out-of-range months and carries them into the year
export function shiftMonth(month: string, delta: number): string {
  const { year, month: monthNumber } = splitMonth(month)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return toMonthString(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1)
}

// "2026-02" -> { from: "2026-02-01", to: "2026-02-28" }, the `from`/`to` params of GET /transactions.
// Day 0 of the next month is the last day of this one, so leap years come for free
export function monthRange(month: string): { from: string; to: string } {
  const { year, month: monthNumber } = splitMonth(month)
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` }
}

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })

// "2026-11" -> "Noviembre de 2026". Spanish month names are lowercase, so the first letter is capitalized
export function formatMonth(month: string): string {
  const { year, month: monthNumber } = splitMonth(month)
  const text = monthFormatter.format(new Date(Date.UTC(year, monthNumber - 1, 1)))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const shortMonthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' })

// "2026-11" -> "nov", for chart axes where the full name does not fit. Some browsers add a dot ("nov."),
// so it is removed
export function formatShortMonth(month: string): string {
  const { year, month: monthNumber } = splitMonth(month)
  return shortMonthFormatter.format(new Date(Date.UTC(year, monthNumber - 1, 1))).replace('.', '')
}
