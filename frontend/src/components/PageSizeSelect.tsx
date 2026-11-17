import { useId } from 'react'
import { PAGE_SIZE_OPTIONS, parsePageSize, type PageSize } from '../utils/pageSize'

interface PageSizeSelectProps {
  value: PageSize
  onChange: (size: PageSize) => void
}

function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  const id = useId()

  function handleChange(rawValue: string) {
    // Always valid (the options come from PAGE_SIZE_OPTIONS), but parsing keeps the type honest
    const size = parsePageSize(rawValue)
    if (size) onChange(size)
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <label htmlFor={id}>Mostrar</label>
      <select
        id={id}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span>por página</span>
    </div>
  )
}

export default PageSizeSelect
