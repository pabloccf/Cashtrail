import { Wallet } from 'lucide-react'

// The app's mark (a wallet on a brand gradient) and its name. The favicon (public/favicon.svg)
// draws the same mark, so keep both in sync if it changes
function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-brand">
        <Wallet className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">Cashtrail</span>
    </span>
  )
}

export default BrandLogo
