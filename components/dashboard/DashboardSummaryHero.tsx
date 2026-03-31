import Image from 'next/image'
import { formatCurrency } from '@/lib/utils/currency'
import { getInitials, getAvatarPastel } from '@/lib/utils/logos'
import type { DashboardStats } from '@/types'

interface Props {
  firstName: string
  fullName: string
  avatarUrl: string | null
  stats: DashboardStats
  sharedCount: number
  currency?: string
}

export default function DashboardSummaryHero({
  firstName,
  fullName,
  avatarUrl,
  stats,
  sharedCount,
  currency = 'EUR',
}: Props) {
  const { bg, fg } = getAvatarPastel(fullName || firstName || 'U')
  const initials   = getInitials(fullName || firstName || 'U')

  const monthly  = formatCurrency(stats.total_monthly_cost, currency)
  const annual   = formatCurrency(stats.total_annual_cost, currency)
  const savings  = formatCurrency(stats.shared_monthly_cost, currency)
  const total    = stats.active_count + stats.trial_count
  const hasSave  = stats.shared_monthly_cost > 0.01 && sharedCount > 0

  const name = firstName || 'de nuevo'

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E8E8E8] dark:border-[#2C2C2E] px-6 pt-5 pb-6">

      {/* Row: greeting + avatar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-semibold text-[#424242] dark:text-[#AEAEB2]">
          Hola, {name}.
        </p>
        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#E8E8E8] dark:ring-[#2C2C2E]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName || name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-sm font-semibold select-none"
              style={{ backgroundColor: bg, color: fg }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Main statement */}
      <p className="text-[28px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-[1.2] tracking-tight mb-4">
        Tu pago mensual es de{' '}
        <span className="text-[#3D3BF3] dark:text-[#8B89FF]">{monthly}</span>
        {' '}y al año gastas{' '}
        <span className="text-[#3D3BF3] dark:text-[#8B89FF]">{annual}</span>.
      </p>

      {/* Supporting statement */}
      <p className="text-[16px] text-[#424242] dark:text-[#AEAEB2] leading-relaxed">
        Tienes{' '}
        <span className="font-semibold text-[#3D3BF3] dark:text-[#8B89FF]">
          {total} {total === 1 ? 'suscripción activa' : 'suscripciones activas'}
        </span>
        {hasSave ? (
          <>
            , y ahorras{' '}
            <span className="font-semibold text-[#3D3BF3] dark:text-[#8B89FF]">
              {savings} al mes
            </span>
            {' '}por compartir{' '}
            <span className="font-semibold text-[#3D3BF3] dark:text-[#8B89FF]">
              {sharedCount} {sharedCount === 1 ? 'suscripción' : 'suscripciones'}
            </span>.
          </>
        ) : '.'}
      </p>
    </div>
  )
}
