import CategoryIcon from '../../components/CategoryIcon'
import TransactionAmount from '../../components/TransactionAmount'
import TrashIcon from '../../components/TrashIcon'
import type { RecurringTransaction } from '../../types/recurring'
import { formatDate } from '../../utils/date'
import { formatSchedule } from '../../utils/recurring'
import Card from '../../components/Card'

interface RecurringListItemProps {
  recurring: RecurringTransaction
  isToggling: boolean
  onEdit: (recurring: RecurringTransaction) => void
  onToggle: (recurring: RecurringTransaction) => void
  onDelete: (recurring: RecurringTransaction) => void
}

function Tag({ children, className }: { children: string; className: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>{children}</span>
  )
}

// Same structure as CategoryListItem: tapping the row edits, the trash icon deletes.
// In between, a switch pauses or resumes it. They are sibling buttons: HTML does not allow nesting them
function RecurringListItem({ recurring, isToggling, onEdit, onToggle, onDelete }: RecurringListItemProps) {
  const { active } = recurring

  return (
    <Card padding="none" className="flex items-stretch">
      <button
        type="button"
        onClick={() => onEdit(recurring)}
        // Paused ones are dimmed. Only the content, so the switch keeps its normal look
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-l-2xl p-3 text-left hover:bg-slate-50 active:bg-slate-50 ${active ? '' : 'opacity-50'}`}
      >
        <CategoryIcon icon={recurring.category.icon} color={recurring.category.color} />
        {/* Texts wrap instead of being truncated: on mobile there is little room next to the amount,
            switch and trash, and the schedule is important. min-w-0 lets the flex item shrink */}
        <div className="min-w-0 flex-1">
          <p className="font-medium break-words">{recurring.description}</p>
          <p className="text-xs text-slate-500">
            {formatSchedule(recurring)} · {recurring.category.name}
          </p>
          {(!active || recurring.mode === 'CONFIRM' || recurring.endDate) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {!active && <Tag className="bg-slate-200 text-slate-700">Pausado</Tag>}
              {recurring.mode === 'CONFIRM' && <Tag className="bg-amber-100 text-amber-800">Pide confirmación</Tag>}
              {recurring.endDate && (
                <Tag className="bg-slate-100 text-slate-600">{`Hasta ${formatDate(recurring.endDate)}`}</Tag>
              )}
            </div>
          )}
        </div>
        <TransactionAmount amount={recurring.amount} type={recurring.type} />
      </button>

      <div className="flex shrink-0 items-center border-l border-slate-100 px-1">
        {/* role="switch" + aria-checked: screen readers announce it as an on/off switch.
            The 44px-high button is the touch area; the visible track inside is smaller */}
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label={`Activo: ${recurring.description}`}
          onClick={() => onToggle(recurring)}
          disabled={isToggling}
          className="group flex min-h-11 w-12 items-center justify-center rounded-lg disabled:opacity-60"
        >
          <span
            className={`relative h-6 w-10 rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-brand-500 ${active ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : ''}`}
            />
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(recurring)}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl border-l border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-50 active:text-rose-600"
        aria-label={`Eliminar fijo ${recurring.description}`}
      >
        <TrashIcon className="size-5" />
      </button>
    </Card>
  )
}

export default RecurringListItem
