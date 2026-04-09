'use client'

import { motion, useTransform, useMotionTemplate } from 'framer-motion'
import { useEffectiveScrollY } from '@/lib/hooks/useEffectiveScrollY'
import { useT } from '@/lib/i18n/LocaleProvider'

export default function EmptyDashboardHero() {
  const t = useT()

  // Mirror the SubscriptionsView header scroll behaviour: untouched
  // until ~60 px of scroll, then opacity + blur ramp to zero over the
  // next 140 px.
  const scrollY             = useEffectiveScrollY()
  const headerOpacity       = useTransform(scrollY, [60, 200], [1, 0])
  const headerBlurPx        = useTransform(scrollY, [60, 200], [0, 8])
  const headerFilter        = useMotionTemplate`blur(${headerBlurPx}px)`
  const headerPointerEvents = useTransform(headerOpacity, (v) => v < 0.05 ? 'none' : 'auto')

  return (
    <motion.div
      className="relative z-[40] pb-4 bg-white dark:bg-[#121212]"
      style={{ opacity: headerOpacity, filter: headerFilter, pointerEvents: headerPointerEvents }}
    >
      <div className="pt-2">
        <h1 className="text-[28px] font-bold text-[#121212] dark:text-[#F2F2F7] tracking-tight">
          {t('dashboard.title')}
        </h1>
      </div>
    </motion.div>
  )
}
