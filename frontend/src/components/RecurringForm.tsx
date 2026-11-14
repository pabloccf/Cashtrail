import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../hooks/useCategories'
import type { TransactionType } from '../types/transaction'
import type { RecurringInput, RecurringTransaction } from '../types/recurring'
import { centsToInput, parseAmountToCents } from '../utils/money'
import { toIsoDateOnly, todayIsoDate } from '../utils/date'
import { MONTH_NAMES, maxDaysInMonth } from '../utils/recurring'
import TransactionTypeToggle from './TransactionTypeToggle'

// The form works with text (what the inputs and selects hold). Numbers are converted only on submit
const recurringFormSchema = z
  .object({
    type: z.enum(['EXPENSE', 'INCOME']),
    amount: z.string().refine((value) => {
      const cents = parseAmountToCents(value)
      return cents !== null && cents > 0
    }, 'Introduce un importe válido, por ejemplo 12,50'),
    categoryId: z.string().min(1, 'Elige una categoría'),
    description: z.string().trim().min(1, 'Escribe una descripción, por ejemplo "Spotify"').max(255, 'Máximo 255 caracteres'),
    frequency: z.enum(['MONTHLY', 'YEARLY']),
    dayOfMonth: z.string(),
    monthOfYear: z.string(),
    startDate: z.iso.date('Elige una fecha'),
    // Empty text means "it never ends"
    endDate: z.union([z.literal(''), z.iso.date('Elige una fecha válida')]),
    mode: z.enum(['AUTO', 'CONFIRM']),
  })
  // "YYYY-MM-DD" strings sort the same way as the dates they represent
  .refine((values) => !values.endDate || values.startDate <= values.endDate, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['endDate'],
  })

type RecurringFormValues = z.infer<typeof recurringFormSchema>

function getDefaultValues(recurring: RecurringTransaction | undefined, defaultType: TransactionType): RecurringFormValues {
  if (!recurring) {
    const today = todayIsoDate() // "YYYY-MM-DD"
    return {
      type: defaultType,
      amount: '',
      categoryId: '',
      description: '',
      frequency: 'MONTHLY',
      // Today's day and month: a new recurring transaction usually starts around today
      dayOfMonth: String(Number(today.slice(8, 10))),
      monthOfYear: String(Number(today.slice(5, 7))),
      startDate: today,
      endDate: '',
      mode: 'AUTO',
    }
  }
  return {
    type: recurring.type,
    amount: centsToInput(recurring.amount),
    categoryId: recurring.categoryId,
    description: recurring.description,
    frequency: recurring.frequency,
    dayOfMonth: String(recurring.dayOfMonth),
    // A monthly one has no month: the current one is preselected in case it is changed to yearly
    monthOfYear: String(recurring.monthOfYear ?? Number(todayIsoDate().slice(5, 7))),
    startDate: toIsoDateOnly(recurring.startDate),
    endDate: recurring.endDate ? toIsoDateOnly(recurring.endDate) : '',
    mode: recurring.mode,
  }
}

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'YEARLY', label: 'Anual' },
] as const

const modeOptions = [
  { value: 'AUTO', label: 'Automático', description: 'Se apunta solo. Para importes fijos, como Spotify o un préstamo.' },
  {
    value: 'CONFIRM',
    label: 'Pedir confirmación',
    description: 'Se apunta como pendiente y lo confirmas o ajustas. Para importes que varían, como la luz.',
  },
] as const

interface RecurringFormProps {
  // Present when editing, missing when creating
  recurring?: RecurringTransaction
  // Type preselected when creating (from the "Añadir" button of each section)
  defaultType: TransactionType
  isSubmitting: boolean
  submitError?: string
  onSubmit: (input: RecurringInput) => void
  onCancel: () => void
}

const inputClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ' +
  'aria-invalid:border-rose-500'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-rose-600">{message}</p>
}

function RecurringForm({ recurring, defaultType, isSubmitting, submitError, onSubmit, onCancel }: RecurringFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: getDefaultValues(recurring, defaultType),
  })

  // useWatch re-renders when these fields change, so the rest of the form can follow them
  const [selectedType, frequency, monthOfYear, startDate] = useWatch({
    control,
    name: ['type', 'frequency', 'monthOfYear', 'startDate'],
  })
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data?.filter((category) => category.type === selectedType) ?? []

  // Yearly: only the days that month can have ("31 de abril" does not exist). Monthly: 1-31
  const maxDay = frequency === 'YEARLY' ? maxDaysInMonth(Number(monthOfYear)) : 31
  const dayOptions = Array.from({ length: maxDay }, (_, index) => index + 1)

  // If the chosen day does not exist in the new month (31 -> February), it moves to the last valid one
  function clampDay() {
    const max = getValues('frequency') === 'YEARLY' ? maxDaysInMonth(Number(getValues('monthOfYear'))) : 31
    if (Number(getValues('dayOfMonth')) > max) {
      setValue('dayOfMonth', String(max))
    }
  }

  const isStartInPast = !recurring && startDate !== '' && startDate < todayIsoDate()

  // handleSubmit only calls this when the schema validation passes
  function submit(values: RecurringFormValues) {
    const amount = parseAmountToCents(values.amount)
    if (amount === null) return // Cannot happen: the schema already checked it

    onSubmit({
      type: values.type,
      amount,
      categoryId: values.categoryId,
      description: values.description,
      frequency: values.frequency,
      dayOfMonth: Number(values.dayOfMonth),
      monthOfYear: values.frequency === 'YEARLY' ? Number(values.monthOfYear) : null,
      startDate: values.startDate,
      endDate: values.endDate || null,
      mode: values.mode,
    })
  }

  return (
    // noValidate: Zod shows the errors instead of the browser's own messages
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      {recurring && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
          Los cambios solo afectan a los próximos registros. Los que ya están apuntados no cambian.
        </p>
      )}

      {/* The previous category belongs to the other type, so it is cleared */}
      <TransactionTypeToggle registration={register('type', { onChange: () => setValue('categoryId', '') })} />

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Descripción
        </label>
        <input
          id="description"
          type="text"
          maxLength={255}
          placeholder="Spotify, préstamo del coche, nómina…"
          className={inputClass}
          aria-invalid={errors.description ? true : undefined}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium">
            Importe (€)
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
            <option value="">{categoriesQuery.isPending ? 'Cargando…' : 'Elige'}</option>
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
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium">Se repite</legend>
        {/* Same visual pattern as TransactionTypeToggle: hidden radios and styled spans */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          {frequencyOptions.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                value={option.value}
                className="peer sr-only"
                {...register('frequency', { onChange: clampDay })}
              />
              <span className="flex min-h-11 items-center justify-center rounded-md text-sm font-medium text-slate-600 peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dayOfMonth" className="mb-1 block text-sm font-medium">
            Día
          </label>
          <select id="dayOfMonth" className={inputClass} {...register('dayOfMonth')}>
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* The month only exists for yearly ones. When hidden, its value is ignored on submit */}
        {frequency === 'YEARLY' && (
          <div>
            <label htmlFor="monthOfYear" className="mb-1 block text-sm font-medium">
              Mes
            </label>
            <select id="monthOfYear" className={inputClass} {...register('monthOfYear', { onChange: clampDay })}>
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {frequency === 'MONTHLY' && (
        <p className="-mt-2 text-sm text-slate-500">
          Si un mes tiene menos días (por ejemplo, el 31 en febrero), se usa el último día del mes.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
            Desde
          </label>
          <input
            id="startDate"
            type="date"
            className={inputClass}
            aria-invalid={errors.startDate ? true : undefined}
            {...register('startDate')}
          />
          <FieldError message={errors.startDate?.message} />
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
            Hasta <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="endDate"
            type="date"
            className={inputClass}
            aria-invalid={errors.endDate ? true : undefined}
            {...register('endDate')}
          />
          <FieldError message={errors.endDate?.message} />
        </div>
      </div>
      {isStartInPast && (
        <p className="-mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          La fecha de inicio es anterior a hoy: también se apuntarán los registros desde esa fecha hasta hoy.
        </p>
      )}

      <fieldset>
        <legend className="mb-1 block text-sm font-medium">Al llegar el día</legend>
        <div className="flex flex-col gap-2">
          {modeOptions.map((option) => (
            // has-checked: styles the card when the radio inside it is selected
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-lg border border-slate-300 p-3 has-checked:border-emerald-500 has-checked:bg-emerald-50 has-focus-visible:ring-2 has-focus-visible:ring-emerald-500"
            >
              <input type="radio" value={option.value} className="mt-1 accent-emerald-600" {...register('mode')} />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-slate-600">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

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
          className="min-h-11 rounded-lg bg-emerald-600 px-5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default RecurringForm
