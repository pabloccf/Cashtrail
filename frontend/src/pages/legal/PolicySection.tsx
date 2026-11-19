import type { ReactNode } from 'react'

interface PolicySectionProps {
  title: string
  children: ReactNode
}

// A titled block of the privacy policy
function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-2 leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export default PolicySection
