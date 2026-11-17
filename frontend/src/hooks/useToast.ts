import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

export interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
}

// A Context shares a value with every component below its Provider, however deep, without passing
// it through props. ToastProvider (components/ToastProvider.tsx) supplies the real functions.
// The default value (null) is what a component gets if it is rendered outside the Provider
export const ToastContext = createContext<ToastApi | null>(null)

// Short feedback after an action: const toast = useToast(); toast.success('Transacción añadida')
export function useToast(): ToastApi {
  const toast = useContext(ToastContext)
  // Fails loudly in development instead of silently showing nothing
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>')
  return toast
}
