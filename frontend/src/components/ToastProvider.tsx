import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastApi, type ToastItem, type ToastTone } from '../hooks/useToast'
import Toast from './Toast'

// How long a toast stays on screen. Long enough to read a short sentence
const DURATION_MS = 4000
// More would cover the page; the oldest one goes away first
const MAX_VISIBLE = 3

// Holds the list of toasts, gives every component below it the functions to show one (through
// ToastContext) and draws them in a fixed corner of the screen
function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  // A counter for unique ids. useRef: it survives re-renders and changing it does not re-render
  const nextId = useRef(1)

  // useCallback keeps the same functions between renders. Otherwise every toast would create a new
  // `api` object and re-render every component that uses useToast()
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, tone, message }].slice(-MAX_VISIBLE))
      // If it was already closed by hand, this filter just finds nothing to remove
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
    }),
    [show],
  )

  return (
    <ToastContext value={api}>
      {children}
      {/* Always in the page, even when empty: screen readers only announce changes inside a live
          region that already existed. role="status" is a polite one: it waits for a pause to speak.
          Mobile: centered above the bottom bar. Desktop: bottom-right corner.
          pointer-events-none on the area, so the empty space never blocks clicks on the page */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-stretch gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  )
}

export default ToastProvider
