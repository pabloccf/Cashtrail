import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import TextField from '../../components/TextField'
import { useRegister } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/errorMessage'
import AuthLayout from './AuthLayout'
import Button from '../../components/Button'

// Same limits as the backend. bcrypt only uses the first 72 bytes ("ñ" or "€" take more than 1)
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_BYTES = 72

const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Introduce tu nombre').max(50, 'Máximo 50 caracteres'),
    email: z.string().trim().min(1, 'Introduce tu email').pipe(z.email('Introduce un email válido')),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
      .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES, 'La contraseña es demasiado larga'),
    confirmPassword: z.string(),
  })
  // Rule that involves two fields: it goes on the object, and `path` says where to show the error
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return 'Ya existe una cuenta con ese email.'
  return getErrorMessage(error)
}

function RegisterPage() {
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  // confirmPassword is only checked here: it is not sent to the backend
  function submit({ name, email, password }: RegisterFormValues) {
    registerMutation.mutate({ name, email, password })
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-700 underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <TextField label="Nombre" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        {/* "new-password" makes password managers offer to generate a strong one */}
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {registerMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {getRegisterErrorMessage(registerMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
