import { toIsoDateOnly } from './date'

export interface DayGroup<T> {
  day: string // "YYYY-MM-DD"
  items: T[]
}

// Groups consecutive items of the same day, keeping their order. The transactions arrive sorted by
// date, so one pass is enough. Generic (<T>): it works with anything that has a `date`
export function groupByDay<T extends { date: string }>(items: T[]): DayGroup<T>[] {
  const groups: DayGroup<T>[] = []
  for (const item of items) {
    const day = toIsoDateOnly(item.date)
    const last = groups.at(-1)
    if (last && last.day === day) last.items.push(item)
    else groups.push({ day, items: [item] })
  }
  return groups
}
