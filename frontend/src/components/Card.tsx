import type { HTMLAttributes } from 'react'

const paddingClasses = {
  none: '',
  md: 'p-4',
  lg: 'p-6',
} as const

interface CardProps extends HTMLAttributes<HTMLElement> {
  // The HTML element to render: a <section> for a block with a heading, an <li> inside a list...
  as?: 'div' | 'section' | 'li'
  padding?: keyof typeof paddingClasses
}

// White surface with rounded corners and a soft shadow: the frame of every block of the app.
// The ring (a 1px shadow) gives the edge a hint of definition without the weight of a gray border.
// Like in Button, `className` is for layout (flex, gap...), not for colors or padding
function Card({ as: Tag = 'div', padding = 'md', className = '', ...props }: CardProps) {
  return (
    <Tag className={`rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5 ${paddingClasses[padding]} ${className}`} {...props} />
  )
}

export default Card
