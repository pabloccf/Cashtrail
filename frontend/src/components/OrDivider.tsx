interface OrDividerProps {
  label?: string
}

// Horizontal line with a word in the middle, between two alternative ways of doing the same thing
// (e.g. "Continue with Google" and the email form)
function OrDivider({ label = 'o' }: OrDividerProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      {/* The lines are decoration: screen readers only read the word */}
      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      {label}
      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
    </div>
  )
}

export default OrDivider
