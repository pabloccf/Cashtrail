import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { KeyRound } from 'lucide-react'
import { GOOGLE_LINK_URL, type GoogleLinkError } from '../../api/auth'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorState from '../../components/ErrorState'
import GoogleLogo from '../../components/GoogleLogo'
import Modal from '../../components/Modal'
import Skeleton from '../../components/Skeleton'
import { useAuthMethods, useUnlinkGoogle } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errorMessage'
import SetPasswordForm from './SetPasswordForm'

// Messages for the ?google_error=… the backend adds when linking Google does not work
const LINK_ERROR_MESSAGES: Record<GoogleLinkError, string> = {
  google_cancelled: 'Has cancelado la vinculación con Google.',
  google_failed: 'No se ha podido vincular tu cuenta de Google. Inténtalo de nuevo.',
  google_in_use: 'Esa cuenta de Google ya está vinculada a otro usuario de Cashtrail.',
  already_linked: 'Ya tienes otra cuenta de Google vinculada. Desvincúlala antes de vincular otra.',
}

// Object.hasOwn and not `in`: the URL can contain anything, and `in` also finds keys like "toString"
function getLinkErrorMessage(code: string | null): string | null {
  return code && Object.hasOwn(LINK_ERROR_MESSAGES, code) ? LINK_ERROR_MESSAGES[code as GoogleLinkError] : null
}

interface SignInMethodsSectionProps {
  email: string
}

// How the user can sign in: password and Google. Lets them link or unlink Google and, if they signed
// up with Google, create a password
function SignInMethodsSection({ email }: SignInMethodsSectionProps) {
  const { data: methods, isPending, isError, error, refetch } = useAuthMethods()
  const unlinkMutation = useUnlinkGoogle()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [isConfirmingUnlink, setIsConfirmingUnlink] = useState(false)

  const linkError = getLinkErrorMessage(searchParams.get('google_error'))

  // Back from Google with ?google=linked: one toast, and the parameter is removed so reloading the
  // page does not show it again. The ref stops React's development double run (StrictMode runs
  // effects twice) from showing two toasts
  const linkedToastShown = useRef(false)
  useEffect(() => {
    if (searchParams.get('google') !== 'linked' || linkedToastShown.current) return
    linkedToastShown.current = true
    toast.success('Cuenta de Google vinculada')
    setSearchParams(
      (params) => {
        params.delete('google')
        return params
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams, toast])

  function confirmUnlink() {
    unlinkMutation.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmingUnlink(false)
        toast.success('Google desvinculado')
      },
    })
  }

  function cancelUnlink() {
    setIsConfirmingUnlink(false)
    // An error from a previous attempt is not shown again the next time the dialog opens
    unlinkMutation.reset()
  }

  const googleLinked = methods?.providers.includes('GOOGLE') ?? false

  return (
    <Card as="section" aria-labelledby="sign-in-methods-title" className="flex flex-col gap-4">
      <div>
        <h2 id="sign-in-methods-title" className="font-semibold">
          Inicio de sesión
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">Las formas que tienes de entrar en tu cuenta.</p>
      </div>

      {linkError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {linkError}
        </p>
      )}

      {isPending ? (
        <div className="flex flex-col gap-3" role="status">
          <span className="sr-only">Cargando métodos de inicio de sesión…</span>
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : isError ? (
        <ErrorState
          message="No se han podido cargar los métodos de inicio de sesión."
          error={error}
          onRetry={() => refetch()}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          <li className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Contraseña</p>
              <p className="text-sm text-slate-500">
                {methods.hasPassword
                  ? 'Puedes entrar con tu email y tu contraseña.'
                  : 'No tienes contraseña: ahora solo puedes entrar con Google.'}
              </p>
            </div>
            {!methods.hasPassword && (
              <Button variant="secondary" size="sm" onClick={() => setIsSettingPassword(true)}>
                Crear contraseña
              </Button>
            )}
          </li>

          <li className="flex flex-wrap items-center gap-3 py-3 last:pb-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <GoogleLogo className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Google</p>
              <p className="text-sm text-slate-500">
                {googleLinked
                  ? methods.hasPassword
                    ? 'Vinculada: puedes entrar con «Continuar con Google».'
                    : 'Vinculada. Crea una contraseña para poder desvincularla.'
                  : 'Vincúlala para entrar con un clic, sin escribir la contraseña.'}
              </p>
            </div>
            {googleLinked ? (
              // Disabled without a password: unlinking would leave the account with no way to sign in.
              // The backend refuses it too (409); this only avoids offering an action that would fail
              <Button
                variant="secondary"
                size="sm"
                disabled={!methods.hasPassword}
                onClick={() => setIsConfirmingUnlink(true)}
              >
                Desvincular
              </Button>
            ) : (
              // A link and not a Button: it navigates to the backend, which sends the browser to Google.
              // Same look as Button's secondary variant in size sm
              <a
                href={GOOGLE_LINK_URL}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 transition ring-inset hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
              >
                Vincular
              </a>
            )}
          </li>
        </ul>
      )}

      {isSettingPassword && (
        <Modal title="Crear contraseña" onClose={() => setIsSettingPassword(false)}>
          <SetPasswordForm
            email={email}
            onDone={() => setIsSettingPassword(false)}
            onCancel={() => setIsSettingPassword(false)}
          />
        </Modal>
      )}

      {isConfirmingUnlink && (
        <ConfirmDialog
          title="¿Desvincular Google?"
          message="Ya no podrás entrar con «Continuar con Google». Seguirás entrando con tu email y tu contraseña, y podrás volver a vincularla cuando quieras."
          confirmLabel="Desvincular"
          confirmingLabel="Desvinculando…"
          isConfirming={unlinkMutation.isPending}
          error={unlinkMutation.isError ? getErrorMessage(unlinkMutation.error) : undefined}
          onConfirm={confirmUnlink}
          onCancel={cancelUnlink}
        />
      )}
    </Card>
  )
}

export default SignInMethodsSection
