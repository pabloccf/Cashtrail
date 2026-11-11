import type { ReactNode } from 'react'
import { useOpenDialog } from '../hooks/useOpenDialog'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

// Uses the native <dialog> element (see useOpenDialog).
// It opens when it is mounted: the parent shows it with {isOpen && <Modal ... />}
function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useOpenDialog()

  return (
    <dialog
      ref={dialogRef}
      // Fired when closing with Esc
      onClose={onClose}
      // A click on the dialog element itself (not its content) is a click on the dark backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      // Same pop-up animation as ConfirmDialog: fades in and grows slightly when it opens
      className="m-auto w-[calc(100%-2rem)] max-w-lg scale-100 rounded-2xl bg-white p-0 opacity-100 shadow-xl transition duration-200 ease-out backdrop:bg-slate-900/40 starting:scale-95 starting:opacity-0"
      aria-labelledby="modal-title"
    >
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg text-2xl text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

export default Modal
