'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getInitials, getAvatarPastel } from '@/lib/utils/logos'

interface SubscriptionAvatarProps {
  name: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE = {
  sm: { cls: 'w-9 h-9',       text: 'text-xs font-semibold',  px: 36 },
  md: { cls: 'w-11 h-11',     text: 'text-sm font-semibold',  px: 44 },
  lg: { cls: 'w-14 h-14',     text: 'text-base font-bold',    px: 56 },
  xl: { cls: 'w-[72px] h-[72px]', text: 'text-xl font-bold', px: 72 },
}

export default function SubscriptionAvatar({
  name,
  logoUrl,
  size = 'md',
}: SubscriptionAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const { cls, text, px } = SIZE[size]
  const { bg, fg } = getAvatarPastel(name)
  const initials = getInitials(name)

  if (logoUrl && !imgError) {
    return (
      <div className={`${cls} rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F5F5] border border-[#F0F0F0]`}>
        <Image
          src={logoUrl}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-contain p-[10%]"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`${cls} rounded-xl flex-shrink-0 flex items-center justify-center select-none ${text}`}
      style={{ backgroundColor: bg, color: fg }}
      aria-label={`${name} avatar`}
    >
      {initials}
    </div>
  )
}
