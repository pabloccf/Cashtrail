import { useId, useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { fieldClass, fieldErrorClass, labelClass } from '../utils/formStyles'

// Same props as TextField, except `type`: this component decides it
interface PasswordFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string
  error?: string
}

// Password input with an eye button to show or hide what has been typed. Hidden by default
function PasswordField({ label, error, ...inputProps }: PasswordFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          // Switching the type is all it takes: the value stays, only how it is drawn changes
          type={visible ? 'text' : 'password'}
          // pr-11: room on the right so the text never runs under the button.
          // [&::-ms-reveal]:hidden hides Edge's own eye, so there are never two
          className={`${fieldClass} pr-11 [&::-ms-reveal]:hidden`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          // Keeps the focus (and the mobile keyboard) in the input when the button is clicked
          onMouseDown={(event) => event.preventDefault()}
          // The label says what the button will do, so screen readers announce the current action
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-controls={id}
          className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      )}
    </div>
  )
}

export default PasswordField
