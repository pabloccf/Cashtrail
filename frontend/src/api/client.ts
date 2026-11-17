// Small wrapper around fetch for every call to the backend.
// It adds the /api prefix, sends JSON and turns error responses into an ApiError

// Error shape returned by the backend: { error: { message, details? } }
interface ApiErrorBody {
  error: { message: string; details?: unknown }
}

// Status used when the request never got a response
export const NETWORK_ERROR_STATUS = 0

// `message` keeps the backend's original (English) text for debugging.
// The text shown to the user comes from getErrorMessage() in utils/errorMessage.ts
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'object' &&
    body.error !== null &&
    'message' in body.error &&
    typeof body.error.message === 'string'
  )
}

// Sends the request and turns every failure into an ApiError: no response at all (network) or an
// error status (4xx/5xx). Shared by JSON requests and file downloads, so both fail the same way
async function send(method: string, path: string, data?: unknown): Promise<Response> {
  let response: Response
  try {
    // Relative URL: the request goes to the same domain, so the session cookie is sent automatically
    response = await fetch(`/api${path}`, {
      method,
      headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    })
  } catch {
    // fetch only throws when there is no response at all (no connection, server unreachable)
    throw new ApiError(NETWORK_ERROR_STATUS, 'Network error')
  }

  if (!response.ok) {
    // If the body is not JSON (e.g. the backend is down and the proxy answers with HTML), keep null
    const body: unknown = await response.json().catch(() => null)
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.message, body.error.details)
    }
    throw new ApiError(response.status, `Request failed with status ${response.status}`)
  }

  return response
}

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const response = await send(method, path, data)

  // 204 No Content (e.g. DELETE) has no body to parse
  if (response.status === 204) {
    return undefined as T
  }

  // The backend is trusted to return the type T; there is no runtime check here
  const body: unknown = await response.json().catch(() => null)
  return body as T
}

// Content-Disposition: attachment; filename="cashtrail-todo.csv" -> "cashtrail-todo.csv".
// The quotes are optional (Express only adds them when the name needs them)
function getFilename(contentDisposition: string | null, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/)
  return match?.[1] ?? fallback
}

export interface DownloadedFile {
  blob: Blob // The raw content of the file
  filename: string // Name chosen by the backend
}

// For endpoints that return a file instead of JSON (the CSV export)
async function download(path: string, fallbackFilename: string): Promise<DownloadedFile> {
  const response = await send('GET', path)
  return {
    blob: await response.blob(),
    filename: getFilename(response.headers.get('Content-Disposition'), fallbackFilename),
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, data: unknown) => request<T>('POST', path, data),
  put: <T>(path: string, data: unknown) => request<T>('PUT', path, data),
  // `data` is optional: some PATCH actions need no body (e.g. toggling a recurring transaction)
  patch: <T>(path: string, data?: unknown) => request<T>('PATCH', path, data),
  delete: (path: string) => request<void>('DELETE', path),
  download,
}
