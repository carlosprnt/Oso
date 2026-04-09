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
    <>
      {/* Greeting + avatar — scrolls naturally with the page (NOT
         sticky/fixed). Sits at z-40 so it stacks above the global
         .top-fade-mask (z-30) and never picks up its backdrop blur. */}
      <div className="relative z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between bg-white dark:bg-[#121212]">
        <p className="text-[17px] font-bold text-black dark:text-[#F2F2F7]">
          {t('dashboard.greeting')} {name}.
        </p>
        <UserAvatarMenu shareText={shareText} />
      </div>

      {/* Tagline */}
      <div className="pb-5">
        <p className="text-[17px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-snug">
          Empieza a añadir suscripciones y descubre una vision global de tus gastos.
        </p>
      </div>
    </>
  )
}
