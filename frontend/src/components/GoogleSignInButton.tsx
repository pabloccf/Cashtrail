import { GOOGLE_SIGN_IN_URL } from '../api/auth'
import GoogleLogo from './GoogleLogo'

// "Continue with Google". A link and not a <button>: it does not run an action on this page, it
// navigates to the backend, which sends the browser to Google (OAuth works with full-page redirects).
// Same look as Button's `secondary` variant, which can only render a <button>
function GoogleSignInButton() {
  return (
    <a
      href={GOOGLE_SIGN_IN_URL}
      className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-xl bg-white px-5 font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 transition ring-inset hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
    >
      <GoogleLogo className="size-5" />
      Continuar con Google
    </a>
  )
}

export default GoogleSignInButton
