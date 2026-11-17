import { Wallet } from 'lucide-react'

// Full class names (not built from strings), so Tailwind can find them when it generates the CSS
const toneClasses = {
  // On light backgrounds: the mark on the brand gradient, the name in dark ink
  default: {
    mark: 'bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-brand',
    name: 'text-slate-900',
  },
  // On the brand gradient itself (the panel of the login page): a translucent white mark
  inverted: {
    mark: 'bg-white/15 text-white ring-1 ring-white/25',
    name: 'text-white',
  },
} as const

interface BrandLogoProps {
  tone?: keyof typeof toneClasses
}

// The app's mark (a wallet on a brand gradient) and its name. The favicon (public/favicon.svg)
// draws the same mark, so keep both in sync if it changes
function BrandLogo({ tone = 'default' }: BrandLogoProps) {
  const classes = toneClasses[tone]
  return (
    <span className="flex items-center gap-2.5">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${classes.mark}`}>
        <Wallet className="size-5" aria-hidden="true" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${classes.name}`}>Cashtrail</span>
    </span>
  )
}

export default BrandLogo
