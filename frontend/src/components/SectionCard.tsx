import type { ReactNode } from 'react'
import { Link } from 'react-router'
import Card from './Card'

interface SectionCardProps {
  title: string
  // Optional link in the header, e.g. "Ver todas" to the full list
  link?: { to: string; label: string }
  children: ReactNode
}

// White card with a title, the frame of each block of the dashboard (charts and lists)
function SectionCard({ title, link, children }: SectionCardProps) {
  return (
    // min-w-0 lets the card shrink inside a grid, so the charts can measure their real width
    <Card as="section" className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {link && (
          // Negative margin: the 44px touch area grows around the text without moving the title
          <Link
            to={link.to}
            className="-my-2 flex min-h-11 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </Card>
  )
}

export default SectionCard
