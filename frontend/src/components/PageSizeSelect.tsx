import { useId } from 'react'
import { PAGE_SIZE_OPTIONS, parsePageSize, type PageSize } from '../utils/pageSize'
import { fieldSurfaceClass } from '../utils/formStyles'

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
        // Not selectClass: that one is full width, and this select sits inside a sentence
        className={`${fieldSurfaceClass} select-chevron pr-10 pl-3.5`}
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
