import type { ReactNode } from 'react'

interface FullPageMessageProps {
  children: ReactNode
}

// Centered message used while the session is being checked (or if that check fails)
function FullPageMessage({ children }: FullPageMessageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center text-slate-600">
      {children}
    </div>
  )
}

export default FullPageMessage
