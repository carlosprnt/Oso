'use client'

import { formatCurrency } from '@/lib/utils/currency'
import UserAvatarMenu from '@/components/dashboard/UserAvatarMenu'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { DashboardStats, Category } from '@/types'

interface Props {
  stats: DashboardStats
  sharedCount: number
  firstName: string
  mostExpensiveName: string | null
  mostExpensiveCost: number
  topCategoryName: Category | null
  nextRenewalName: string | null
  nextRenewalDays: number | null
  currency?: string
}

export default function AnalyticsLayer({
  stats, sharedCount, firstName,
  mostExpensiveName, mostExpensiveCost,
  topCategoryName, nextRenewalName, nextRenewalDays,
  currency = 'EUR',
}: Props) {
  const t = useT()
  const monthly = formatCurrency(stats.total_monthly_cost, currency)
  const annual  = formatCurrency(stats.total_annual_cost, currency)
  const active  = stats.active_count + stats.trial_count
  const savings = formatCurrency(stats.shared_monthly_cost, currency)

  const renewalLabel = nextRenewalDays === 0
    ? 'hoy'
    : nextRenewalDays === 1
    ? 'mañana'
    : `en ${nextRenewalDays} días`

  return (
    <div
      className="h-full flex flex-col px-7 overflow-y-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
    >
      {/* Header row: greeting + avatar */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
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

        {/* Extra insights */}
        <div className="space-y-3 pt-3">
          {mostExpensiveName && (
            <p className="text-white/60 text-[15px] leading-snug">
              Tu suscripción más cara es <span className="text-white font-semibold">{mostExpensiveName}</span> con {formatCurrency(mostExpensiveCost, currency)} /mes.
            </p>
          )}

          {topCategoryName && (
            <p className="text-white/60 text-[15px] leading-snug">
              Tu categoría principal de gasto es <span className="text-white font-semibold">{t(`categories.${topCategoryName}` as Parameters<typeof t>[0])}</span>.
            </p>
          )}

          {nextRenewalName && nextRenewalDays !== null && (
            <p className="text-white/60 text-[15px] leading-snug">
              La próxima en renovarse es <span className="text-white font-semibold">{nextRenewalName}</span>, {renewalLabel}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
