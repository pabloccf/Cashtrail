// The backend stores calendar days at 00:00 UTC. Formatting in UTC keeps the same day everywhere:
// with the browser's time zone, a user in America would see "3 nov" for a transaction made on the 4th
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

// "2026-11-04T00:00:00.000Z" -> "4 nov 2026"
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}

const dayMonthFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })

// "2026-11-04T00:00:00.000Z" -> "4 nov". For short lists where the year is obvious
export function formatDayMonth(isoDate: string): string {
  return dayMonthFormatter.format(new Date(isoDate))
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
