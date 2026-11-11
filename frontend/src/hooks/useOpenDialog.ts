import { useEffect, useRef } from 'react'

// Opens a native <dialog> as a modal as soon as the component is mounted.
// showModal() puts it above everything, blocks the page behind it, keeps the keyboard
// focus inside and closes with Esc. Shared by Modal and ConfirmDialog
export function useOpenDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    // The `open` check matters in development: StrictMode runs effects twice
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return dialogRef
}
