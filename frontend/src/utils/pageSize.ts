// Page sizes offered in the transactions list. The backend only accepts these values
// (PAGE_SIZE_OPTIONS in backend/src/schemas/transaction.schema.ts), so keep both lists in sync
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
export const DEFAULT_PAGE_SIZE: PageSize = 25

const STORAGE_KEY = 'cashtrail:transactions-page-size'

// A "type guard": when it returns true, TypeScript knows `value` is a PageSize and not just any number
function isPageSize(value: number): value is PageSize {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

// "25" -> 25. Missing or invalid values (the URL and localStorage can be edited by hand) -> undefined
export function parsePageSize(value: string | null): PageSize | undefined {
  const size = Number(value)
  return value !== null && isPageSize(size) ? size : undefined
}

// localStorage can throw (private mode, blocked site data...), and a remembered preference
// is not worth breaking the page for, so errors just fall back to the default
export function loadPageSize(): PageSize {
  try {
    return parsePageSize(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

export function savePageSize(size: PageSize): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(size))
  } catch {
    // Not saved: the next visit uses the default again
  }
}
