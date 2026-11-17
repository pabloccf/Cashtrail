import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useOpenDialog } from '../hooks/useOpenDialog'
import { dialogClass } from '../utils/dialogStyles'

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
      // Bottom sheet on mobile, centered pop-up on desktop (see dialogStyles.ts)
      className={`${dialogClass} md:max-w-lg`}
      aria-labelledby="modal-title"
    >
      {/* Sticky header: in a long form (a recurring transaction) the title and the close button
          stay visible while the content scrolls under them */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white px-5 pt-4 pb-2">
        <h2 id="modal-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 flex size-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Cerrar"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="px-5 pt-2 pb-5">{children}</div>
    </dialog>
  )
}

export default Modal
