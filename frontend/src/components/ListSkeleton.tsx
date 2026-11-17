import Skeleton from './Skeleton'

interface ListSkeletonProps {
  label: string // Read by screen readers, e.g. "Cargando transacciones…"
  rows?: number
  // Height of each row, to match the real items (h-12 in a compact list, h-20 for cards...)
  rowClassName?: string
}

// Placeholder rows while a list loads
function ListSkeleton({ label, rows = 3, rowClassName = 'h-20 rounded-2xl' }: ListSkeletonProps) {
  return (
    // role="status": screen readers announce the label, which is hidden on screen (sr-only)
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={rowClassName} />
      ))}
    </div>
  )
}

export default ListSkeleton
