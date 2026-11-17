interface SkeletonProps {
  // Size and shape of the block (h-6 w-32, h-48...)
  className?: string
}

// Gray pulsing block that stands in for content while it loads. It hints at the shape of what is
// coming, so the page does not jump when the data arrives.
// aria-hidden: it means nothing to a screen reader. Whoever uses it announces the loading state
function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} aria-hidden="true" />
}

export default Skeleton
