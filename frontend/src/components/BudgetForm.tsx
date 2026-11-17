import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Budget } from '../types/budget'
import type { TransactionCategory } from '../types/transaction'
import { centsToInput, parseAmountToCents } from '../utils/money'
import CategoryIcon from './CategoryIcon'
import { useMoney } from '../hooks/useMoney'
import Button from './Button'

// The form works with text (what the inputs and selects hold). The amount is converted only on submit
const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría'),
  amount: z.string().refine((value) => {
    const cents = parseAmountToCents(value)
    return cents !== null && cents > 0
  }, 'Introduce un importe válido, por ejemplo 300'),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

export interface BudgetFormData {
  categoryId: string
  amount: number // In cents
}

interface BudgetFormProps {
  // Present when editing, missing when creating
  budget?: Budget
  // Expense categories that can still get a budget this month. Only used when creating
  availableCategories: TransactionCategory[]
  isSubmitting: boolean
  submitError?: string
  onSubmit: (data: BudgetFormData) => void
  onCancel: () => void
}

const inputClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base ' +
  'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ' +
  'aria-invalid:border-rose-500'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-rose-600">{message}</p>
}

function BudgetForm({ budget, availableCategories, isSubmitting, submitError, onSubmit, onCancel }: BudgetFormProps) {
  const { symbol } = useMoney()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: budget?.category.id ?? '',
      amount: budget ? centsToInput(budget.amount) : '',
    },
  })

  // handleSubmit only calls this when the schema validation passes
  function submit(values: BudgetFormValues) {
    const amount = parseAmountToCents(values.amount)
    if (amount === null) return // Cannot happen: the schema already checked it
    onSubmit({ categoryId: values.categoryId, amount })
  }

  return (
    // noValidate: Zod shows the errors instead of the browser's own messages
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      {budget ? (
        // The category of a budget cannot change (that would be another budget), so it is only shown
        <div>
          <p className="mb-1 text-sm font-medium">Categoría</p>
          <p className="flex min-h-11 items-center gap-2 font-medium">
            <CategoryIcon icon={budget.category.icon} color={budget.category.color} size="sm" />
            {budget.category.name}
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
            Categoría
          </label>
          <select
            id="categoryId"
            className={inputClass}
            aria-invalid={errors.categoryId ? true : undefined}
            {...register('categoryId')}
          >
            <option value="">Elige</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId?.message} />
        </div>
      )}

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
          Límite del mes ({symbol})
        </label>
        {/* Same as in TransactionForm: text + inputMode="decimal" accepts the comma */}
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className={inputClass}
          aria-invalid={errors.amount ? true : undefined}
          {...register('amount')}
        />
        <FieldError message={errors.amount?.message} />
      </div>

      {submitError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

export default BudgetForm
