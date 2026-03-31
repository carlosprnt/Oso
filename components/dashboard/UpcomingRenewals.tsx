'use client'

import { useT, useLocale } from '@/lib/i18n/LocaleProvider'
import SubscriptionAvatar from '@/components/subscriptions/SubscriptionAvatar'
import { formatCurrency } from '@/lib/utils/currency'
import { resolveSubscriptionLogoUrl } from '@/lib/constants/platforms'
import type { UpcomingRenewal } from '@/types'

interface Props {
  renewals: UpcomingRenewal[]
}

export default function UpcomingRenewals({ renewals }: Props) {
  const t = useT()
  const locale = useLocale()

  if (renewals.length === 0) {
    return <p className="text-sm text-[#737373] py-2">{t('dashboard.noUpcoming')}</p>
  }

  const shown = renewals.slice(0, 3)

  function daysLabel(days: number): string {
    if (days === 0) return t('dashboard.dueToday')
    if (days === 1) return locale === 'es' ? '1 día' : '1 day'
    return t('dashboard.days').replace('{count}', String(days))
  }

  return (
    <div className="space-y-3.5">
      {shown.map((r) => (
        <div key={r.subscription.id} className="flex items-center gap-3">
          <SubscriptionAvatar
            name={r.subscription.name}
            logoUrl={resolveSubscriptionLogoUrl(r.subscription.name, r.subscription.logo_url)}
            size="sm"
            corner="rounded-[8px]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#121212] dark:text-[#F2F2F7] truncate leading-snug">
              {r.subscription.name}
            </p>
            <p className="text-[12px] text-[#737373] dark:text-[#636366] mt-0.5">
              {formatCurrency(r.subscription.my_monthly_cost, r.subscription.currency)}
              {' '}{t('dashboard.perMonth')}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[14px] font-medium tabular-nums text-[#737373] dark:text-[#AEAEB2]">
              {daysLabel(r.days_until)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
