import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import type { GoogleSignInError } from '../../api/auth'
import { ApiError } from '../../api/client'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import OrDivider from '../../components/OrDivider'
import PasswordField from '../../components/PasswordField'
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

// Messages for the ?error=… the backend adds when sign-in with Google does not end in a session
const GOOGLE_ERROR_MESSAGES: Record<GoogleSignInError, string> = {
  google_cancelled: 'Has cancelado el inicio de sesión con Google.',
  google_failed: 'No se ha podido iniciar sesión con Google. Inténtalo de nuevo.',
  email_not_verified:
    'Tu email de Google no está verificado. Verifícalo en Google o regístrate con email y contraseña.',
  account_exists:
    'Ya tienes una cuenta con este email. Inicia sesión con tu contraseña y vincula Google desde Ajustes.',
}

// Object.hasOwn and not `code in GOOGLE_ERROR_MESSAGES`: `in` also finds inherited keys such as
// "toString", and the URL can contain anything
function getGoogleErrorMessage(code: string | null): string | null {
  return code && Object.hasOwn(GOOGLE_ERROR_MESSAGES, code) ? GOOGLE_ERROR_MESSAGES[code as GoogleSignInError] : null
}

function LoginPage() {
  const loginMutation = useLogin()
  const [searchParams, setSearchParams] = useSearchParams()
  const googleError = getGoogleErrorMessage(searchParams.get('error'))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  // Trying the form clears the Google message, so it is never shown next to a new, unrelated error.
  // `replace` so the back button does not bring the message back
  function submit(values: LoginFormValues) {
    if (googleError) setSearchParams({}, { replace: true })
    loginMutation.mutate(values)
  }

  // No navigate() here: on success the user is saved in the cache and GuestRoute redirects
  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Entra para ver tus gastos, ingresos y presupuestos."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {googleError && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {googleError}
        </p>
      )}

      <div className="mb-6 flex flex-col gap-6">
        <GoogleSignInButton />
        <OrDivider label="o con tu email" />
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        {/* autoComplete lets the browser and password managers fill in the right fields */}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {loginMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {getLoginErrorMessage(loginMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={loginMutation.isPending} className="mt-2 w-full">
          {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
