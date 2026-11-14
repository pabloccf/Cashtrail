// Calendar-day helpers. Every DATE column is handled as a Date at 00:00 UTC, so the server's
// time zone never shifts a day. "Today" is the current day in UTC

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "2026-11-04" -> Date at 00:00 UTC. The column is a DATE, so the time part is discarded
export function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

// Current day in UTC at 00:00
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Works across month and year boundaries because it adds milliseconds, not calendar fields.
// UTC has no daylight saving time, so a day is always exactly 24 hours
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}
