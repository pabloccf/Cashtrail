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

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
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

  // 204 No Content (e.g. DELETE) has no body to parse
  if (response.status === 204) {
    return undefined as T
  }

  // If the body is not JSON (e.g. the backend is down and the proxy answers with HTML), keep null
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.message, body.error.details)
    }
    throw new ApiError(response.status, `Request failed with status ${response.status}`)
  }

  // The backend is trusted to return the type T; there is no runtime check here
  return body as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, data: unknown) => request<T>('POST', path, data),
  put: <T>(path: string, data: unknown) => request<T>('PUT', path, data),
  delete: (path: string) => request<void>('DELETE', path),
}
