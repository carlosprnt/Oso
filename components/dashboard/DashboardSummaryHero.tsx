'use client'

import { useRef, useEffect } from 'react'
import { useEffectiveScrollY } from '@/lib/hooks/useEffectiveScrollY'
import { formatCurrency } from '@/lib/utils/currency'
import UserAvatarMenu from '@/components/dashboard/UserAvatarMenu'
import type { DashboardStats } from '@/types'

interface Props {
  firstName: string
  stats: DashboardStats
  sharedCount: number
  shareText: string
  currency?: string
}

export default function DashboardSummaryHero({
  firstName,
  stats,
  sharedCount,
  shareText,
  currency = 'EUR',
}: Props) {
  const ref     = useRef<HTMLDivElement>(null)
  const scrollY = useEffectiveScrollY()

  useEffect(() => {
    // Direct DOM mutation — no Framer Motion compositing layer, no stacking
    // context created by will-change. The hero stays at z-index:auto so the
    // card stack (z-[10]) always paints on top.
    return scrollY.on('change', (v: number) => {
      if (!ref.current) return
      const opacity = Math.max(0, Math.min(1, 1 - v / 220))
      ref.current.style.opacity = String(opacity)
      ref.current.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto'
    })
  }, [scrollY])

  const monthly = formatCurrency(stats.total_monthly_cost, currency)
  const annual  = formatCurrency(stats.total_annual_cost, currency)
  const savings = formatCurrency(stats.shared_monthly_cost, currency)
  const total   = stats.active_count + stats.trial_count
  const hasSave = stats.shared_monthly_cost > 0.01 && sharedCount > 0
  const name    = firstName || 'de nuevo'

  return (
    <div
      ref={ref}
      className="sticky top-0 pb-5 bg-[#F7F8FA] dark:bg-[#111111]"
    >
      {/* Row: greeting + avatar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[17px] font-bold text-black dark:text-[#F2F2F7]">
          Hola, {name}.
        </p>
        <UserAvatarMenu shareText={shareText} />
      </div>

      {/* Main statement */}
      <p className="text-[33px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-[1.2] tracking-tight mb-4">
        Tu gasto mensual es de{' '}
        <span className="text-[#3D3BF3] dark:text-[#8B89FF]">{monthly}</span>
        {' '}y al año gastas{' '}
        <span className="text-[#3D3BF3] dark:text-[#8B89FF]">{annual}</span>.
      </p>

      {/* Supporting statement */}
      <p className="text-[18px] font-bold text-black dark:text-[#F2F2F7] leading-relaxed">
        Tienes{' '}
        <span className="text-[#3D3BF3] dark:text-[#8B89FF]">
          {total} {total === 1 ? 'suscripción activa' : 'suscripciones activas'}
        </span>.
        {hasSave && (
          <>
            {' '}Compartir{' '}
            <span className="text-[#3D3BF3] dark:text-[#8B89FF]">
              {sharedCount}
            </span>
            {' '}te ahorra{' '}
            <span className="text-[#3D3BF3] dark:text-[#8B89FF]">
              {savings} al mes
            </span>.
          </>
        )}
      </p>
    </div>
  )
}
