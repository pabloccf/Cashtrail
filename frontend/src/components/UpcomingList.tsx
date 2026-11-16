import type { UpcomingOccurrence } from '../types/recurring'
import { formatDayMonth, toIsoDateOnly } from '../utils/date'
import CategoryIcon from './CategoryIcon'
import TransactionAmount from './TransactionAmount'

interface UpcomingListProps {
  items: UpcomingOccurrence[] // Oldest first
}

// Upcoming recurring income and expenses. It receives the data by props and does not fetch
// anything, so the shared dashboard (phase 8) can reuse it
function UpcomingList({ items }: UpcomingListProps) {
  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {items.map((item) => (
        // A recurring transaction happens at most once a day, so id + date is unique
        <li key={`${item.recurringTransactionId}-${item.date}`} className="flex min-h-14 items-center gap-3 py-2">
          <CategoryIcon icon={item.category.icon} color={item.category.color} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.description}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <time dateTime={toIsoDateOnly(item.date)}>{formatDayMonth(item.date)}</time>
              {/* CONFIRM mode: it will arrive as pending, and its amount may change */}
              {item.mode === 'CONFIRM' && (
                <>
                  {/* The dot is its own item, so the flex gap spaces both sides evenly */}
                  <span aria-hidden="true">·</span>
                  <span>Importe estimado</span>
                </>
              )}
            </div>
          </div>
          <TransactionAmount amount={item.amount} type={item.type} />
        </li>
      ))}
    </ul>
  )
}

export default UpcomingList
