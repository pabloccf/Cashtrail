import type { ReactNode } from 'react'
import BrandLogo from './BrandLogo'

interface FullPageMessageProps {
  children: ReactNode
}

// Centered message used while the session is being checked (or if that check fails)
function FullPageMessage({ children }: FullPageMessageProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center text-slate-600">
      {/* The logo pulses softly while the session is checked, so the first screen is not just text */}
      <div className="animate-pulse motion-reduce:animate-none">
        <BrandLogo />
      </div>
      {children}
    </div>
  )
}

export default FullPageMessage
