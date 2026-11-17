import { useId, type ComponentProps } from 'react'

// Accepts every prop of a normal <input> (type, autoComplete, and what register() returns:
// name, onChange, onBlur and ref). In React 19 `ref` is a regular prop, no forwardRef needed
interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

function TextField({ label, error, ...inputProps }: TextFieldProps) {
  // Unique id to link the <label>, the <input> and its error message
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none aria-invalid:border-rose-500"
        aria-invalid={error ? true : undefined}
        // Screen readers read the error when the input gets focus
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
