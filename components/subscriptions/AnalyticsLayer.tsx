'use client'

import { formatCurrency } from '@/lib/utils/currency'
import UserAvatarMenu from '@/components/dashboard/UserAvatarMenu'
import type { DashboardStats } from '@/types'

interface Props {
  stats: DashboardStats
  sharedCount: number
  firstName: string
  currency?: string
}

export default function AnalyticsLayer({ stats, sharedCount, firstName, currency = 'EUR' }: Props) {
  const monthly = formatCurrency(stats.total_monthly_cost, currency)
  const annual  = formatCurrency(stats.total_annual_cost, currency)
  const active  = stats.active_count + stats.trial_count
  const savings = formatCurrency(stats.shared_monthly_cost, currency)

  return (
    <div
      className="h-full flex flex-col px-7"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
    >
      {/* Header row: greeting + avatar */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-white text-[17px] font-bold">
          Hola, {firstName || 'de nuevo'}.
        </p>
        <div className="w-10 h-10">
          <UserAvatarMenu />
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-5">
        {/* Monthly */}
        <div>
          <p className="text-white/80 text-[17px] font-bold">
            Al mes gastas
          </p>
          <p className="text-white text-[40px] font-extrabold tracking-tight leading-[1.05] mt-1">
            {monthly}
          </p>
        </div>

        {/* Annual */}
        <div>
          <p className="text-white/80 text-[17px] font-bold">
            Eso al año es
          </p>
          <p className="text-white text-[40px] font-extrabold tracking-tight leading-[1.05] mt-1">
            {annual}
          </p>
        </div>

        {/* Summary sentence */}
        <p className="text-white/80 text-[17px] font-bold leading-snug pt-2">
          Tienes {active} {active === 1 ? 'suscripción activa' : 'suscripciones activas'}.
          {sharedCount > 0 && (
            <> Compartes {sharedCount}, y reduces tu gasto en {savings}.</>
          )}
        </p>
      </div>
    </div>
  )
}
