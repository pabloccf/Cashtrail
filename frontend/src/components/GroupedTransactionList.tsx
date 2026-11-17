import type { Transaction } from '../types/transaction'
import { formatDayHeading } from '../utils/date'
import { groupByDay } from '../utils/groupByDay'
import TransactionCard from './TransactionCard'

interface GroupedTransactionListProps {
  transactions: Transaction[] // Sorted by date, as the API returns them
  onEdit: (transaction: Transaction) => void
  onConfirm: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

// Mobile list of transactions grouped by day, like banking apps: "Hoy", "Ayer", "Lunes, 16 de
// noviembre"... The day goes in the heading, so the cards do not repeat it.
// A day split between two pages shows its heading on both: each page is grouped on its own
function GroupedTransactionList({ transactions, onEdit, onConfirm, onDelete }: GroupedTransactionListProps) {
  return (
    <div className="flex flex-col gap-4">
      {groupByDay(transactions).map((group) => {
        const headingId = `day-${group.day}`
        return (
          // A section per day with its heading: screen readers can jump from day to day
          <section key={group.day} aria-labelledby={headingId}>
            {/* sticky top-14: stays under the mobile top bar (h-14) while its day scrolls by, and the
                next day's heading pushes it away. The negative margin and padding stretch its
                background to the screen edges, so the cards never show through the sides */}
            <h2
              id={headingId}
              className="sticky top-14 z-10 -mx-4 bg-slate-50/90 px-4 py-2 text-sm font-semibold text-slate-500 backdrop-blur-sm"
            >
              <time dateTime={group.day}>{formatDayHeading(group.day)}</time>
            </h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((transaction) => (
                <li key={transaction.id}>
                  <TransactionCard
                    transaction={transaction}
                    showDate={false}
                    onEdit={onEdit}
                    onConfirm={onConfirm}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default GroupedTransactionList
