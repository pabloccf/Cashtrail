interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const buttonClass =
  'min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 ' +
  'hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // A single page does not need controls
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Paginación">
      <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span className="text-sm text-slate-500">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}

export default Pagination
