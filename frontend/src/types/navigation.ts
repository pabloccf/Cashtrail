import type { LucideIcon } from 'lucide-react'

// A section of the app in the navigation (sidebar on desktop, bottom bar on mobile)
export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  // false: only in the desktop sidebar. The mobile bottom bar keeps the sections used every day,
  // so each label has room. Categorías is reached from Ajustes, and Ajustes from the top bar
  inBottomBar: boolean
}
