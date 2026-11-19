import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import OrDivider from '../../components/OrDivider'
import PasswordField from '../../components/PasswordField'
import TextField from '../../components/TextField'
import { useRegister } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/errorMessage'
import { newPasswordSchema } from '../../utils/password'
import AuthLayout from './AuthLayout'
import Button from '../../components/Button'

const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Introduce tu nombre').max(50, 'Máximo 50 caracteres'),
    email: z.string().trim().min(1, 'Introduce tu email').pipe(z.email('Introduce un email válido')),
    password: newPasswordSchema,
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
      title="Crea tu cuenta"
      subtitle="Empieza a registrar tus gastos en menos de un minuto."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {/* Errors from Google always go to /login: there the user can also sign in with a password */}
      <div className="mb-6 flex flex-col gap-6">
        <GoogleSignInButton />
        <OrDivider label="o con tu email" />
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <TextField label="Nombre" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        {/* "new-password" makes password managers offer to generate a strong one */}
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

        {registerMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {getRegisterErrorMessage(registerMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={registerMutation.isPending} className="mt-2 w-full">
          {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
