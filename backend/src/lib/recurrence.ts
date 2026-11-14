import type { Frequency } from '../generated/prisma/enums.js';

// The fields of a recurring transaction that decide on which days it happens
export interface RecurrenceRule {
  frequency: Frequency;
  dayOfMonth: number; // 1-31
  monthOfYear: number | null; // 1-12, only for YEARLY
  startDate: Date;
  endDate: Date | null;
}

// Day 0 of the next month is the last day of this one. `monthIndex` is 0-based, like in Date
function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// The day of that month on which the rule happens. If the month is shorter than `dayOfMonth`
// (the 31st in February), its last day is used
function occurrenceInMonth(rule: RecurrenceRule, year: number, monthIndex: number): Date {
  const day = Math.min(rule.dayOfMonth, daysInMonth(year, monthIndex));
  return new Date(Date.UTC(year, monthIndex, day));
}

// Every day between `from` and `to` (both included) on which the rule happens, oldest first.
// Pure function: it only computes dates and does not touch the database, so it is easy to test.
// All dates are calendar days at 00:00 UTC
export function getOccurrenceDates(rule: RecurrenceRule, from: Date, to: Date): Date[] {
  // Never before startDate nor after endDate
  const start = from > rule.startDate ? from : rule.startDate;
  const end = rule.endDate && rule.endDate < to ? rule.endDate : to;
  if (start > end) return [];

  const dates: Date[] = [];
  let year = start.getUTCFullYear();
  let monthIndex = start.getUTCMonth();
  const endYear = end.getUTCFullYear();
  const endMonthIndex = end.getUTCMonth();

  // One candidate per month from the month of `start` to the month of `end`.
  // In the first and last month the candidate may fall outside the range, so it is checked
  while (year < endYear || (year === endYear && monthIndex <= endMonthIndex)) {
    const isDueMonth = rule.frequency === 'MONTHLY' || monthIndex + 1 === rule.monthOfYear;
    if (isDueMonth) {
      const date = occurrenceInMonth(rule, year, monthIndex);
      if (date >= start && date <= end) {
        dates.push(date);
      }
    }

    monthIndex += 1;
    if (monthIndex === 12) {
      monthIndex = 0;
      year += 1;
    }
  }

  return dates;
}
