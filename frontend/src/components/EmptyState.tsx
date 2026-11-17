import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  // Actions (buttons) and status messages under the text
  children?: ReactNode
}

// A list with nothing to show: an icon, what is happening and, when there is one, the way out
// (create the first one, look in other months...). The dashed border says "this space is for
// something that is not here yet", unlike a regular card
function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      {description && <div className="mt-1 max-w-sm text-sm text-slate-500">{description}</div>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

export default EmptyState
