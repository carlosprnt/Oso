'use client'

import { useT } from '@/lib/i18n/LocaleProvider'

export default function EmptyDashboardHero() {
  const t = useT()

  return (
    <div className="relative z-[40] pb-4 bg-white dark:bg-[#121212]">
      <div className="pt-2">
        <h1 className="text-[28px] font-bold text-[#121212] dark:text-[#F2F2F7] tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-[18px] font-bold text-[#121212] dark:text-[#F2F2F7] mt-1 leading-snug">
          {t('subscriptions.getStarted')}
        </p>
      </div>
    </div>
  )
}
