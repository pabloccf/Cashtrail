import type { UseFormRegisterReturn } from 'react-hook-form'

const typeOptions = [
  { value: 'EXPENSE', label: 'Gasto', checkedClass: 'peer-checked:bg-rose-600' },
  { value: 'INCOME', label: 'Ingreso', checkedClass: 'peer-checked:bg-emerald-600' },
] as const

interface TransactionTypeToggleProps {
  // What `register('type')` returns (name, onChange, onBlur, ref). Each form registers the field
  // itself, so it can add its own options (e.g. clearing the category when the type changes)
  registration: UseFormRegisterReturn
}

// Expense / income selector shared by the transaction and category forms
function TransactionTypeToggle({ registration }: TransactionTypeToggleProps) {
  return (
    <fieldset>
      <legend className="sr-only">Tipo</legend>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {typeOptions.map((option) => (
          <label key={option.value} className="cursor-pointer">
            {/* A real radio input, visually hidden: the styled span reacts to it with `peer-checked:`.
                Both radios share the same registration: React Hook Form groups them by `name` */}
            <input type="radio" value={option.value} className="peer sr-only" {...registration} />
            <span
              className={`flex min-h-11 items-center justify-center rounded-md text-sm font-medium text-slate-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 ${option.checkedClass}`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default TransactionTypeToggle
