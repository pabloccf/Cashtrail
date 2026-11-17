import type { ComponentProps } from 'react'

// Full class names (not built from strings), so Tailwind can find them when it generates the CSS
const variantClasses = {
  // The main action of a screen or a form (save, create...)
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  // A second action next to the primary one (cancel in a dialog...)
  secondary: 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
  // A low-key action that should not draw attention (cancel in a form...)
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  // Destructive actions (delete...)
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
} as const

// Both sizes keep the 44px touch height; `sm` only has less padding and smaller text
const sizeClasses = {
  md: 'px-5',
  sm: 'px-3 text-sm',
} as const

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
}

// The app's button. Accepts every prop of a normal <button> (onClick, disabled, type, form...).
// `className` is added at the end for layout only (width, margins...): it should not set colors,
// padding or display, because two Tailwind classes for the same property do not override each other
// by their order in the attribute, but by their order in the generated CSS
function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...buttonProps }: ButtonProps) {
  return (
    <button
      // "button" by default: a <button> inside a <form> is "submit" unless it says otherwise,
      // and an accidental submit is a classic bug. Submit buttons pass type="submit" explicitly
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...buttonProps}
    />
  )
}

export default Button
