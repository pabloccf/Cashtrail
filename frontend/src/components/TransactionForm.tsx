import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../hooks/useCategories'
import type { Transaction, TransactionInput } from '../types/transaction'
import { centsToInput, parseAmountToCents } from '../utils/money'
import { toIsoDateOnly, todayIsoDate } from '../utils/date'
import TransactionTypeToggle from './TransactionTypeToggle'
import { useMoney } from '../hooks/useMoney'

// The form works with text (what the inputs hold). The amount is converted to cents only on submit
const transactionFormSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.string().refine((value) => {
    const cents = parseAmountToCents(value)
    return cents !== null && cents > 0
  }, 'Introduce un importe válido, por ejemplo 12,50'),
  categoryId: z.string().min(1, 'Elige una categoría'),
  date: z.iso.date('Elige una fecha'),
  description: z.string().trim().max(255, 'Máximo 255 caracteres'),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

function getDefaultValues(transaction?: Transaction): TransactionFormValues {
  if (!transaction) {
    return { type: 'EXPENSE', amount: '', categoryId: '', date: todayIsoDate(), description: '' }
  }
  return {
    type: transaction.type,
    amount: centsToInput(transaction.amount),
    categoryId: transaction.categoryId,
    date: toIsoDateOnly(transaction.date),
    description: transaction.description ?? '',
  }
}

interface TransactionFormProps {
  // Present when editing, missing when creating
  transaction?: Transaction
  isSubmitting: boolean
  submitError?: string
  onSubmit: (input: TransactionInput) => void
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

function TransactionForm({ transaction, isSubmitting, submitError, onSubmit, onCancel }: TransactionFormProps) {
  const { symbol } = useMoney()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: getDefaultValues(transaction),
  })

  // useWatch re-renders when `type` changes, so the category list follows the selected type
  const selectedType = useWatch({ control, name: 'type' })
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data?.filter((category) => category.type === selectedType) ?? []

  // handleSubmit only calls this when the schema validation passes
  function submit(values: TransactionFormValues) {
    const amount = parseAmountToCents(values.amount)
    if (amount === null) return // Cannot happen: the schema already checked it

    onSubmit({
      type: values.type,
      amount,
      categoryId: values.categoryId,
      date: values.date,
      description: values.description || undefined,
    })
  }

  return (
    // noValidate: Zod shows the errors instead of the browser's own messages
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      {/* The previous category belongs to the other type, so it is cleared */}
      <TransactionTypeToggle registration={register('type', { onChange: () => setValue('categoryId', '') })} />

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
          Importe ({symbol})
        </label>
        {/* type="text" + inputMode="decimal": numeric keyboard on mobile, and the comma is accepted.
            type="number" depends on the browser language and returns a float */}
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

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          Categoría
        </label>
        <select
          id="categoryId"
          className={inputClass}
          disabled={categoriesQuery.isPending}
          aria-invalid={errors.categoryId ? true : undefined}
          {...register('categoryId')}
        >
          <option value="">{categoriesQuery.isPending ? 'Cargando…' : 'Elige una categoría'}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categoriesQuery.isError && (
          <p className="mt-1 text-sm text-rose-600">No se han podido cargar las categorías.</p>
        )}
        <FieldError message={errors.categoryId?.message} />
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">
          Fecha
        </label>
        <input
          id="date"
          type="date"
          className={inputClass}
          aria-invalid={errors.date ? true : undefined}
          {...register('date')}
        />
        <FieldError message={errors.date?.message} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Descripción <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <input
          id="description"
          type="text"
          maxLength={255}
          className={inputClass}
          aria-invalid={errors.description ? true : undefined}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {submitError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg px-4 font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-lg bg-brand-600 px-5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
