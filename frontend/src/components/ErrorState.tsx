import { CircleAlert } from 'lucide-react'
import { getErrorMessage } from '../utils/errorMessage'

interface ErrorStateProps {
  message: string // What could not be loaded, e.g. "No se han podido cargar las transacciones."
  error: Error
  onRetry: () => void
}

// A request that failed, with the reason and a "Reintentar" button. Used for a whole page and for a
// single dashboard block (each block loads on its own, so one failing does not hide the others)
function ErrorState({ message, error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200" role="alert">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">{message}</p>
        <p className="mt-0.5 text-rose-700">{getErrorMessage(error)}</p>
        {/* Negative margin: the 44px touch area grows around the text without adding space */}
        <button
          type="button"
          className="-mx-2 mt-1 min-h-11 rounded-lg px-2 font-semibold underline-offset-2 hover:bg-rose-100 hover:underline"
          onClick={onRetry}
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}

export default ErrorState
