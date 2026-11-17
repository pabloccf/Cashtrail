import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Category, CategoryInput } from '../types/category'
import type { TransactionType } from '../types/transaction'
import { CATEGORY_ICON_OPTIONS } from '../utils/categoryIcons'
import CategoryIcon from './CategoryIcon'
import TextField from './TextField'
import TransactionTypeToggle from './TransactionTypeToggle'
import Button from './Button'
import { fieldErrorClass, labelClass } from '../utils/formStyles'

// Same palette as the default categories, so the defaults are always shown as selected
const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#64748b', '#94a3b8',
]

const categoryFormSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  name: z.string().trim().min(1, 'Escribe un nombre').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Elige un color'),
  icon: z.string().min(1, 'Elige un icono'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

function getDefaultValues(category: Category | undefined, defaultType: TransactionType): CategoryFormValues {
  if (category) {
    return { type: category.type, name: category.name, color: category.color, icon: category.icon }
  }
  return { type: defaultType, name: '', color: COLOR_OPTIONS[0], icon: 'tag' }
}

interface CategoryFormProps {
  // Present when editing, missing when creating
  category?: Category
  // Type preselected when creating (the section where "Añadir" was pressed)
  defaultType: TransactionType
  isSubmitting: boolean
  submitError?: string
  onSubmit: (input: CategoryInput) => void
  onCancel: () => void
}

function CategoryForm({ category, defaultType, isSubmitting, submitError, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getDefaultValues(category, defaultType),
  })

  // Watched to draw the preview and to know whether the color is a custom one
  const [name, color, icon] = useWatch({ control, name: ['name', 'color', 'icon'] })
  const isCustomColor = !COLOR_OPTIONS.includes(color.toLowerCase())

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Preview: how the category will look in the lists */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <CategoryIcon icon={icon} color={color} />
        <span className="truncate font-medium">{name.trim() || 'Nueva categoría'}</span>
      </div>

      <TransactionTypeToggle registration={register('type')} />

      <TextField label="Nombre" autoComplete="off" maxLength={50} error={errors.name?.message} {...register('name')} />

      <fieldset>
        <legend className={labelClass}>Color</legend>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
          {COLOR_OPTIONS.map((option) => (
            <label key={option} className="flex size-11 cursor-pointer items-center justify-center">
              <input type="radio" value={option} className="peer sr-only" aria-label={option} {...register('color')} />
              {/* The ring shows which color is selected (and which one has keyboard focus) */}
              <span
                className="size-8 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500"
                style={{ backgroundColor: option }}
              />
            </label>
          ))}
          {/* Any other color with the browser's native color picker */}
          <label
            className="relative flex size-11 cursor-pointer items-center justify-center"
            title="Otro color"
          >
            <input
              type="color"
              value={color}
              onChange={(event) => setValue('color', event.target.value, { shouldValidate: true })}
              className="peer absolute inset-0 cursor-pointer opacity-0"
              aria-label="Otro color"
            />
            <span
              className={`flex size-8 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-lg text-slate-500 ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 ${isCustomColor ? 'ring-2 ring-slate-900' : ''}`}
              style={isCustomColor ? { backgroundColor: color, borderStyle: 'none' } : undefined}
            >
              {isCustomColor ? '' : '+'}
            </span>
          </label>
        </div>
        {errors.color && <p className={fieldErrorClass}>{errors.color.message}</p>}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Icono</legend>
        {/* Fixed height with its own scroll, so the form fits on small screens */}
        <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-1 sm:grid-cols-8">
          {CATEGORY_ICON_OPTIONS.map(({ name: iconName, label, Icon }) => (
            <label key={iconName} className="cursor-pointer" title={label}>
              <input type="radio" value={iconName} className="peer sr-only" aria-label={label} {...register('icon')} />
              <span className="flex size-11 items-center justify-center rounded-lg text-slate-600 peer-checked:bg-slate-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 hover:bg-slate-100 peer-checked:hover:bg-slate-900">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </label>
          ))}
        </div>
        {errors.icon && <p className={fieldErrorClass}>{errors.icon.message}</p>}
      </fieldset>

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

export default CategoryForm
