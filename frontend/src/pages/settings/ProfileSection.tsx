import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import TextField from '../../components/TextField'
import { useUpdateProfile } from '../../hooks/useAuth'
import type { User } from '../../types/user'
import { CURRENCY_LABELS, SUPPORTED_CURRENCIES, isSupportedCurrency } from '../../utils/currency'
import { getErrorMessage } from '../../utils/errorMessage'
import Button from '../../components/Button'
import Card from '../../components/Card'

// Same rules as the backend (updateProfileBodySchema)
const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribe tu nombre').max(50, 'Máximo 50 caracteres'),
  currency: z.enum(SUPPORTED_CURRENCIES),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSectionProps {
  user: User
}

function ProfileSection({ user }: ProfileSectionProps) {
  const updateMutation = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      // A currency outside the list (cannot happen today) falls back to EUR instead of breaking the select
      currency: isSupportedCurrency(user.currency) ? user.currency : 'EUR',
    },
  })

  function submit(values: ProfileFormValues) {
    updateMutation.mutate(values, {
      // reset() makes the saved values the new "clean" state: isDirty goes back to false, so the
      // button is disabled again and the "saved" message shows until the next change
      onSuccess: (updated) => reset({ name: updated.name, currency: values.currency }),
    })
  }

  return (
    <Card as="section" aria-labelledby="profile-title" className="flex flex-col gap-4">
      <h2 id="profile-title" className="font-semibold">
        Perfil
      </h2>

      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <TextField label="Nombre" autoComplete="name" maxLength={50} error={errors.name?.message} {...register('name')} />

        {/* The email cannot be changed here (it would need the current password), so it is only shown */}
        <div>
          <p className="mb-1 text-sm font-medium">Email</p>
          <p className="flex min-h-11 items-center text-slate-600">{user.email}</p>
        </div>

        <div>
          <label htmlFor="currency" className="mb-1 block text-sm font-medium">
            Moneda
          </label>
          <select
            id="currency"
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
            {...register('currency')}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {CURRENCY_LABELS[currency]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-slate-500">
            Solo cambia cómo se muestran los importes. No convierte ninguna cantidad.
          </p>
        </div>

        {updateMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            No se han podido guardar los cambios: {getErrorMessage(updateMutation.error)}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          {updateMutation.isSuccess && !isDirty && (
            <p className="text-sm text-emerald-700" role="status">
              Cambios guardados
            </p>
          )}
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileSection
