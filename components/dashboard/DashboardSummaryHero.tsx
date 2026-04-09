'use client'

import { motion, useTransform, useMotionTemplate } from 'framer-motion'
import { useEffectiveScrollY } from '@/lib/hooks/useEffectiveScrollY'
import { formatCurrency } from '@/lib/utils/currency'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { DashboardStats } from '@/types'

interface Props {
  stats: DashboardStats
  currency?: string
}

export default function DashboardSummaryHero({
  stats,
  currency = 'EUR',
}: Props) {
  const t       = useT()
  const monthly = formatCurrency(stats.total_monthly_cost, currency)
  const total   = stats.active_count + stats.trial_count

  // Same scroll-driven animation as the SubscriptionsView header: the
  // header stays crisp until the user has actually scrolled past ~60 px,
  // then opacity + blur ramp over the next 140 px.
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
        {total > 0 && (
          <p className="text-[18px] font-bold text-[#121212] dark:text-[#F2F2F7] mt-1 leading-snug">
            Pagas <span className="underline underline-offset-2">{monthly}</span> /mes en{' '}
            {total === 1 ? '1 suscripción activa' : `${total} suscripciones activas`}.
          </p>
        )}
      </div>
    </motion.div>
  )
}
