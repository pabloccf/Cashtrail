import type { ReactNode } from 'react'
import { useOpenDialog } from '../hooks/useOpenDialog'
import { dialogClass } from '../utils/dialogStyles'
import Button from './Button'
import TrashIcon from './TrashIcon'

interface ConfirmDialogProps {
  title: string
  message: ReactNode
  confirmLabel: string
  // While the action runs, the buttons are disabled and the dialog cannot be dismissed
  isConfirming?: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}

// Pop-up confirmation for destructive actions (delete...). Like Modal, it opens when mounted:
// the parent shows it with {isOpen && <ConfirmDialog ... />}
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isConfirming = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useOpenDialog()

  function dismiss() {
    if (!isConfirming) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      // `cancel` fires on Esc. preventDefault stops the browser from closing it by itself:
      // React decides, by unmounting it (and not while the delete request is in progress)
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
      // A click on the dialog element itself (not its content) is a click on the dark backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss()
      }}
      // Bottom sheet on mobile, centered pop-up on desktop, like Modal (see dialogStyles.ts)
      className={`${dialogClass} md:max-w-sm`}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="flex flex-col items-center p-6 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <TrashIcon className="size-7" />
        </div>
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <div id="confirm-message" className="mt-2 text-sm text-slate-600">
          {message}
        </div>

        {error && (
          <p className="mt-4 w-full rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          {/* First in the DOM and autoFocus: Enter on an accidental opening cancels, it never deletes */}
          <Button variant="secondary" autoFocus onClick={dismiss} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? 'Eliminando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
