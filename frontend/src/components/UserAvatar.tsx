interface UserAvatarProps {
  name: string
}

// "Pablo López Gosálvez" -> "PL". "Ana" -> "A"
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

// Circle with the user's initials. Decorative: the name is always written next to it
// (or announced in its place), so screen readers skip it
function UserAvatar({ name }: UserAvatarProps) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

export default UserAvatar
