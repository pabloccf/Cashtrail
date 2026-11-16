// Calendar-month helpers. A month travels as "YYYY-MM" (e.g. "2026-11"), the same format the
// frontend uses in the URL. Like every DATE column, the dates are handled at 00:00 UTC (see date.ts)

// Expects a month already validated as "YYYY-MM" (see stats.schema.ts)
function splitMonth(month: string): { year: number; monthIndex: number } {
  return {
    year: Number(month.slice(0, 4)),
    monthIndex: Number(month.slice(5, 7)) - 1, // 0-based, like in Date
  };
}

// Date -> "2026-11". Works for any day of the month
export function toMonthString(date: Date): string {
  return date.toISOString().slice(0, 7);
}

// First and last day of the month, both included. Day 0 of the next month is the last day of
// this one, so leap years come for free
export function monthRange(month: string): { from: Date; to: Date } {
  const { year, monthIndex } = splitMonth(month);
  return {
    from: new Date(Date.UTC(year, monthIndex, 1)),
    to: new Date(Date.UTC(year, monthIndex + 1, 0)),
  };
}

// ("2026-01", -1) -> "2025-12". Date.UTC accepts out-of-range months and carries them into the year
export function shiftMonth(month: string, delta: number): string {
  const { year, monthIndex } = splitMonth(month);
  return toMonthString(new Date(Date.UTC(year, monthIndex + delta, 1)));
}
