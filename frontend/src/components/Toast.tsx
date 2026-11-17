import { CircleAlert, CircleCheck, X } from 'lucide-react'
import type { ToastItem } from '../hooks/useToast'

// Full class names (not built from strings), so Tailwind can find them when it generates the CSS
const toneStyles = {
  success: { icon: CircleCheck, iconClass: 'text-emerald-400' },
  error: { icon: CircleAlert, iconClass: 'text-rose-400' },
} as const

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: number) => void
}

// A single message. Dark (slate-900) so it stands out over any page, light or with cards.
// The icon repeats the tone, so it never depends on color alone; the text says what happened
function Toast({ toast, onDismiss }: ToastProps) {
  const { icon: Icon, iconClass } = toneStyles[toast.tone]
  return (
    <div
      // Slides up and fades in when it appears (`starting:` = first frame, like the dialogs)
      className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-slate-900 py-2 pr-2 pl-4 text-sm text-white shadow-elevated transition duration-200 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none md:w-auto md:min-w-72"
    >
      <Icon className={`size-5 shrink-0 ${iconClass}`} aria-hidden="true" />
      <p className="flex-1 py-2 font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
        aria-label="Cerrar aviso"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export default Toast
