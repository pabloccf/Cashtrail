import { ApiError, NETWORK_ERROR_STATUS } from '../api/client'

// User-facing text for each HTTP status. The backend messages are technical and in English,
// so the frontend decides what the user reads
const messagesByStatus: Record<number, string> = {
  [NETWORK_ERROR_STATUS]: 'No se ha podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
  400: 'Los datos enviados no son válidos. Revísalos e inténtalo de nuevo.',
  401: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se ha encontrado lo que buscabas. Puede que se haya eliminado.',
  409: 'No se puede completar la acción porque entra en conflicto con otros datos.',
}

const SERVER_ERROR_MESSAGE = 'Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.'
const UNKNOWN_ERROR_MESSAGE = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return UNKNOWN_ERROR_MESSAGE
  if (error.status >= 500) return SERVER_ERROR_MESSAGE
  return messagesByStatus[error.status] ?? UNKNOWN_ERROR_MESSAGE
}
