// Shared look of every form field, so inputs and selects are the same everywhere.
// Plain class strings (not components) because each form keeps its own markup: React Hook Form's
// register(), hints with aria-describedby, prefixes... TextField wraps them for the simple cases.

// The field without size or padding: a 1px inset ring as the border (a ring can grow to 2px on
// focus without moving the text, a border would push it), soft shadow, brand ring on focus and
// red ring when invalid. text-base (16px) on purpose: with less, iOS zooms in on focus
export const fieldSurfaceClass =
  'min-h-11 rounded-xl border-0 bg-white text-base text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset ' +
  'transition-shadow placeholder:text-slate-400 hover:ring-slate-400 ' +
  'focus:ring-2 focus:ring-brand-500 focus:outline-none aria-invalid:ring-rose-500 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

// Text, number and date inputs
export const fieldClass = `${fieldSurfaceClass} w-full px-3.5`

// Selects: the browser's arrow is replaced by our own (select-chevron, in index.css),
// with room on the right so the text never runs under it
export const selectClass = `${fieldSurfaceClass} select-chevron w-full pr-10 pl-3.5`

export const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700'

export const fieldErrorClass = 'mt-1.5 text-sm text-rose-600'
