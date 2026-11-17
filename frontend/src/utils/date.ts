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

// "2026-11-04" plus `days` (negative to go back) -> "2026-11-03". In UTC, like the stored days
export function shiftIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

const weekdayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const weekdayWithYearFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// Heading of a day in a list: "Hoy", "Ayer", "Lunes, 16 de noviembre" or, in another year,
// "Martes, 30 de diciembre de 2025". `today` is a parameter so it can be tested with a fixed date
export function formatDayHeading(isoDate: string, today: string = todayIsoDate()): string {
  const day = toIsoDateOnly(isoDate)
  if (day === today) return 'Hoy'
  if (day === shiftIsoDate(today, -1)) return 'Ayer'
  const formatter = day.slice(0, 4) === today.slice(0, 4) ? weekdayFormatter : weekdayWithYearFormatter
  const text = formatter.format(new Date(`${day}T00:00:00Z`))
  return text.charAt(0).toUpperCase() + text.slice(1)
}
