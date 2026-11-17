import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import TextField from '../../components/TextField'
import { useLogin } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/errorMessage'
import AuthLayout from './AuthLayout'
import Button from '../../components/Button'

// Only checks that the fields are filled in: the password rules are enforced on register
const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Introduce tu email').pipe(z.email('Introduce un email válido')),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

// Here a 401 means wrong credentials, not an expired session
function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Email o contraseña incorrectos.'
  return getErrorMessage(error)
}

function LoginPage() {
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  // No navigate() here: on success the user is saved in the cache and GuestRoute redirects
  return (
    <AuthLayout
      title="Iniciar sesión"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-brand-700 underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))} noValidate className="flex flex-col gap-4">
        {/* autoComplete lets the browser and password managers fill in the right fields */}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {loginMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {getLoginErrorMessage(loginMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
