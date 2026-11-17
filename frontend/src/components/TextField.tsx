import { useId, type ComponentProps } from 'react'
import { fieldClass, fieldErrorClass, labelClass } from '../utils/formStyles'

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
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        className={fieldClass}
        aria-invalid={error ? true : undefined}
        // Screen readers read the error when the input gets focus
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
