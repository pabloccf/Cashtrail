import { getErrorMessage } from '../../utils/errorMessage'

interface SectionErrorProps {
  message: string // What could not be loaded, e.g. "No se han podido cargar los gastos por categoría."
  error: Error
  onRetry: () => void
}

// Error of a single dashboard block. Each block loads on its own, so one failing does not hide the others
function SectionError({ message, error, onRetry }: SectionErrorProps) {
  return (
    <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
      <p className="font-medium">{message}</p>
      <p>{getErrorMessage(error)}</p>
      <button type="button" className="min-h-11 font-medium underline" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}

export default SectionError
