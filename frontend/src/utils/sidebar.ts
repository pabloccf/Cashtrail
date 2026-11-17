const STORAGE_KEY = 'cashtrail:sidebar-collapsed'

// From this width (Tailwind's `lg`) there is room for the full sidebar next to the content
const WIDE_SCREEN_QUERY = '(min-width: 1024px)'

// Whether the desktop sidebar starts collapsed. The user's choice wins; without one, it starts
// collapsed on tablets (md) and expanded on large screens (lg).
// Same as pageSize.ts: localStorage can throw, and a preference is not worth breaking the page for
export function loadSidebarCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true' || stored === 'false') return stored === 'true'
  } catch {
    // Falls through to the default
  }
  return !window.matchMedia(WIDE_SCREEN_QUERY).matches
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  } catch {
    // Not saved: the next visit uses the default again
  }
}
