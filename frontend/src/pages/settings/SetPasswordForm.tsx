import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../components/Button'
import PasswordField from '../../components/PasswordField'
import { useSetPassword } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errorMessage'
import { newPasswordSchema } from '../../utils/password'

const setPasswordFormSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>

interface SetPasswordFormProps {
  email: string
  onDone: () => void
  onCancel: () => void
}

// For accounts created with Google: adds a password, so the user can also sign in with email
function SetPasswordForm({ email, onDone, onCancel }: SetPasswordFormProps) {
  const setPasswordMutation = useSetPassword()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  function submit({ password }: SetPasswordFormValues) {
    setPasswordMutation.mutate(password, {
      onSuccess: () => {
        toast.success('Contraseña creada')
        onDone()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Podrás entrar con <span className="font-medium text-slate-900">{email}</span> y esta contraseña, además de con
        Google.
      </p>

      {/* Not shown: tells password managers which account the new password belongs to, so they
          save it under the right email */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />

      <PasswordField
        label="Contraseña"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordField
        label="Repite la contraseña"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {setPasswordMutation.isError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          No se ha podido crear la contraseña: {getErrorMessage(setPasswordMutation.error)}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={setPasswordMutation.isPending}>
          {setPasswordMutation.isPending ? 'Guardando…' : 'Crear contraseña'}
        </Button>
      </div>
    </form>
  )
}

export default SetPasswordForm
