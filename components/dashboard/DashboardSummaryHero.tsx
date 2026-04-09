'use client'

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

  return (
    <div className="relative z-[40] pb-4 bg-white dark:bg-[#121212]">
      <div className="pt-2">
        <h1 className="text-[28px] font-bold text-[#121212] dark:text-[#F2F2F7] tracking-tight">
          {t('dashboard.title')}
        </h1>
        {total > 0 && (
          <p className="text-[18px] font-bold text-[#121212] dark:text-[#F2F2F7] mt-1 leading-snug">
            Pagas <span className="underline underline-offset-2">{monthly}</span> al mes en{' '}
            {total === 1 ? '1 suscripción activa' : `${total} suscripciones activas`}.
          </p>
        )}
      </div>
    </div>
  )
}
