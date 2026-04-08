import Image from 'next/image'
import { getInitials, getAvatarPastel } from '@/lib/utils/logos'

interface LogoAvatarProps {
  name: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/* Uniform 40x40 container for every logo regardless of the `size`
   prop — kept as a type union so existing callers keep working. */
const UNIFIED = { container: 'w-10 h-10', text: 'text-sm', px: 40, py: 40 }
const SIZE_MAP = {
  sm: UNIFIED,
  md: UNIFIED,
  lg: UNIFIED,
}

export default function LogoAvatar({
  name,
  logoUrl,
  size = 'md',
  className = '',
}: LogoAvatarProps) {
  const { container, text, px, py } = SIZE_MAP[size]

  if (logoUrl) {
    return (
      <div
        className={`
          ${container} rounded-xl overflow-hidden flex-shrink-0
          bg-white border border-gray-100 shadow-sm ${className}
        `}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={px}
          height={py}
          className="w-full h-full object-cover"
          unoptimized // logos are external, skip optimization
        />
      </div>
    )
  }

  const { bg, fg } = getAvatarPastel(name)
  const initials = getInitials(name)

  return (
    <div
      className={`
        ${container} rounded-xl flex-shrink-0
        flex items-center justify-center
        font-semibold select-none ${text} ${className}
      `}
      style={{ backgroundColor: bg, color: fg }}
      aria-label={`${name} logo`}
    >
      {initials}
    </div>
  )
}
