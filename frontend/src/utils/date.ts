// "2026-11-04T00:00:00.000Z" -> "04-11-2026" (day-month-year, as in Spain).
// The backend stores calendar days at 00:00 UTC, so the first 10 characters are already the right day.
// Reading them from the text avoids `new Date()`: with the browser's time zone, a user in America
// would see the 3rd for a transaction made on the 4th
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-')
  return `${day}-${month}-${year}`
}

// "2026-11-04T00:00:00.000Z" -> "2026-11-04", the format of <input type="date"> and of the API
export function toIsoDateOnly(isoDate: string): string {
  return isoDate.slice(0, 10)
}

// Today in the user's local time zone as "YYYY-MM-DD".
// Not toISOString(): it uses UTC, so at 00:30 in Spain it would still return yesterday
export function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0') // getMonth() is 0-based
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
