'use client'

import UserAvatarMenu from './UserAvatarMenu'
import { useT } from '@/lib/i18n/LocaleProvider'

interface Props {
  firstName: string
  shareText?: string
}

export default function EmptyDashboardHero({ firstName, shareText }: Props) {
  const t    = useT()
  const name = firstName || t('dashboard.greetingFallback')

  return (
    <div className="pb-5">
      {/* Greeting + avatar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[17px] font-bold text-black dark:text-[#F2F2F7]">
          {t('dashboard.greeting')} {name}.
        </p>
        <UserAvatarMenu shareText={shareText} />
      </div>

      {/* Tagline */}
      <p className="text-[17px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-snug">
        Empieza a añadir suscripciones y descubre una vision global de tus gastos.
      </p>
    </div>
  )
}
