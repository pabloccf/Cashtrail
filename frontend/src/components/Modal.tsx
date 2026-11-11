import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

// Uses the native <dialog> element: showModal() puts it above everything, blocks the page behind it,
// keeps the keyboard focus inside and closes with Esc, with no extra code.
// It opens when it is mounted: the parent shows it with {isOpen && <Modal ... />}
function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    // The `open` check matters in development: StrictMode runs effects twice
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      // Fired when closing with Esc
      onClose={onClose}
      // A click on the dialog element itself (not its content) is a click on the dark backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
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
