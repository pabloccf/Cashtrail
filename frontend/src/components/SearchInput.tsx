import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

const DEBOUNCE_MS = 300

interface SearchInputProps {
  // Committed value (e.g. the one in the URL)
  value: string
  // Called once the user stops typing for DEBOUNCE_MS, not on every key
  onDebouncedChange: (value: string) => void
  label: string
  placeholder?: string
}

// Text box that waits until the user stops typing before reporting the change ("debounce").
// Without it, typing "mercadona" would send 9 requests, one per letter
function SearchInput({ value, onDebouncedChange, label, placeholder }: SearchInputProps) {
  // What the input shows right now. It runs ahead of `value` while the user is typing
  const [text, setText] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // If `value` changes from outside (going back in the browser, "Limpiar filtros"), the box follows it.
  // This is React's "adjust state when a prop changes" pattern: done during render, without an effect
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    // Compared trimmed: after typing "pan " the committed value is "pan", and overwriting the
    // box would delete the space the user is about to follow with "de molde"
    if (value !== text.trim()) setText(value)
  }

  // A pending timer must not fire after the component is gone
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function handleChange(newText: string) {
    setText(newText)
    // Each key cancels the previous timer, so only the last one gets to run
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => onDebouncedChange(newText), DEBOUNCE_MS)
  }

  // Clearing is applied at once: there is nothing left to type
  function handleClear() {
    clearTimeout(timeoutRef.current)
    setText('')
    onDebouncedChange('')
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        maxLength={100}
        // `[&::-webkit-search-cancel-button]:hidden` hides the browser's own "x": there is a custom one
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pr-11 pl-10 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-0 right-0 flex size-11 items-center justify-center text-slate-400 hover:text-slate-600"
          aria-label="Borrar búsqueda"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
