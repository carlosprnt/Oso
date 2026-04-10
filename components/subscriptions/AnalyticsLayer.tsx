'use client'

import { formatCurrency } from '@/lib/utils/currency'
import type { DashboardStats } from '@/types'

interface Props {
  stats: DashboardStats
  totalSubs: number
  currency?: string
}

/**
 * Dark analytics layer that sits behind the main subscriptions surface.
 * Editorial, minimal, data-driven — revealed when the foreground
 * surface is pulled down.
 */
export default function AnalyticsLayer({ stats, totalSubs, currency = 'EUR' }: Props) {
  const monthly = formatCurrency(stats.total_monthly_cost, currency)
  const annual  = formatCurrency(stats.total_annual_cost, currency)
  const active  = stats.active_count + stats.trial_count

  return (
    <div
      className="h-full flex flex-col px-7"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
    >
      <div className="max-w-xl mx-auto w-full space-y-8">
        {/* Editorial headline */}
        <div>
          <p className="text-[#6E6E73] text-[11px] font-semibold uppercase tracking-[0.25em] mb-3">
            Resumen
          </p>
          <p className="text-white text-[32px] font-extrabold tracking-tight leading-[1.08]">
            {monthly}
            <span className="text-[#6E6E73] text-[20px] font-bold ml-1">/mes</span>
          </p>
          <p className="text-[#6E6E73] text-[18px] font-bold mt-1">
            {annual} /año
          </p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
            <p className="text-[#6E6E73] text-[10px] font-semibold uppercase tracking-[0.2em]">
              Activas
            </p>
            <p className="text-white text-[28px] font-bold tabular-nums mt-1 leading-none">
              {active}
            </p>
            <p className="text-[#6E6E73] text-[12px] mt-1.5">
              {active === 1 ? 'suscripción' : 'suscripciones'}
            </p>
          </div>

          {stats.shared_monthly_cost > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
              <p className="text-[#6E6E73] text-[10px] font-semibold uppercase tracking-[0.2em]">
                Compartidas
              </p>
              <p className="text-white text-[28px] font-bold tabular-nums mt-1 leading-none">
                {formatCurrency(stats.shared_monthly_cost, currency)}
              </p>
              <p className="text-[#6E6E73] text-[12px] mt-1.5">
                ahorras /mes
              </p>
            </div>
          )}

          {stats.trial_count > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
              <p className="text-[#6E6E73] text-[10px] font-semibold uppercase tracking-[0.2em]">
                En prueba
              </p>
              <p className="text-white text-[28px] font-bold tabular-nums mt-1 leading-none">
                {stats.trial_count}
              </p>
              <p className="text-[#6E6E73] text-[12px] mt-1.5">
                {stats.trial_count === 1 ? 'suscripción' : 'suscripciones'}
              </p>
            </div>
          )}
        </div>

        {/* Insight line */}
        <p className="text-white/60 text-[14px] leading-relaxed">
          {totalSubs > 0
            ? `Gestionas ${totalSubs} ${totalSubs === 1 ? 'servicio' : 'servicios'} con un coste medio de ${formatCurrency(stats.total_monthly_cost / Math.max(1, active), currency)} /mes.`
            : 'Añade tu primera suscripción para empezar a ver tus datos.'}
        </p>
      </div>
    </div>
  )
}
