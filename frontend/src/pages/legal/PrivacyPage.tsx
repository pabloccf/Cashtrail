import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import BrandLogo from '../../components/BrandLogo'
import Card from '../../components/Card'
import PolicySection from './PolicySection'

// Public on purpose (no login needed): Google links to it from its consent screen, and it must be
// readable before having an account. Plain language, and only what the app really does
const CONTACT_EMAIL = 'dev.pabloccf@gmail.com'
const LAST_UPDATED = '20 de noviembre de 2026'

const linkClass = 'font-medium text-brand-700 underline-offset-2 hover:underline'

function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link to="/" className="self-start" aria-label="Ir a Cashtrail">
          <BrandLogo />
        </Link>

        <Card as="section" padding="lg" aria-labelledby="privacy-title" className="flex flex-col gap-8">
          <div>
            <h1 id="privacy-title" className="text-2xl font-bold tracking-tight md:text-3xl">
              Política de privacidad
            </h1>
            <p className="mt-2 text-sm text-slate-500">Última actualización: {LAST_UPDATED}</p>
          </div>

          <PolicySection title="Qué es Cashtrail">
            <p>
              Cashtrail es un proyecto personal y sin ánimo de lucro para apuntar gastos e ingresos y llevar el control
              de tus finanzas. Es solo una herramienta de registro:{' '}
              <strong className="font-medium text-slate-900">
                nunca realiza pagos, nunca mueve dinero y no se conecta a ningún banco
              </strong>
              .
            </p>
          </PolicySection>

          <PolicySection title="Qué datos guardamos">
            <p>
              Tu nombre, tu email, tu moneda preferida y, si la creas, tu contraseña. La contraseña nunca se guarda tal
              cual: solo una versión cifrada que no permite recuperarla.
            </p>
            <p>
              Y lo que tú apuntas en la app: transacciones, categorías, gastos e ingresos fijos y presupuestos. Son
              anotaciones tuyas; Cashtrail no obtiene datos de ningún banco ni de ninguna otra fuente.
            </p>
          </PolicySection>

          <PolicySection title="Inicio de sesión con Google">
            <p>
              Si entras con Google, solo recibimos tu nombre, tu email y un identificador de tu cuenta de Google, que
              sirve para reconocerte la próxima vez. No tenemos acceso a tu correo, tus contactos, tus archivos ni a
              ningún otro dato de tu cuenta de Google, y no guardamos ningún permiso de acceso a ella.
            </p>
            <p>
              Puedes desvincular Google desde Ajustes, y retirar el acceso de Cashtrail en cualquier momento desde{' '}
              <a
                href="https://myaccount.google.com/connections"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                tu cuenta de Google
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="Para qué los usamos">
            <p>
              Solo para que la app funcione: identificarte cuando entras y mostrarte tus datos. No hay anuncios, no se
              venden ni se comparten tus datos con nadie y no se usan para crear perfiles. Tus datos solo los ves tú.
            </p>
          </PolicySection>

          <PolicySection title="Cookies">
            <p>
              Solo usamos las cookies técnicas imprescindibles: una para mantener tu sesión iniciada y otra temporal, de
              unos minutos, mientras inicias sesión con Google. No hay cookies de publicidad, de analítica ni de
              seguimiento.
            </p>
          </PolicySection>

          <PolicySection title="Dónde se guardan">
            <p>
              La app está alojada en proveedores de servicios en la nube, que solo guardan y procesan los datos para que
              funcione. La base de datos y el servidor están en la Unión Europea.
            </p>
          </PolicySection>

          <PolicySection title="Cuánto tiempo y cómo borrarlos">
            <p>
              Tus datos se guardan mientras tengas una cuenta. Si quieres consultarlos o que borre tu cuenta y todo lo
              que contiene, escríbeme a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>{' '}
              desde el email de tu cuenta. También puedes descargar tus transacciones en cualquier momento desde Ajustes
              (exportar a CSV).
            </p>
          </PolicySection>

          <PolicySection title="Cambios y contacto">
            <p>
              Si esta política cambia, se actualizará la fecha de arriba. Para cualquier duda, escríbeme a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </PolicySection>
        </Card>

        {/* "/" goes to the dashboard if there is a session and to /login if not */}
        <Link
          to="/"
          className="flex min-h-11 items-center justify-center gap-2 self-center rounded-xl px-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a Cashtrail
        </Link>
      </div>
    </div>
  )
}

export default PrivacyPage
