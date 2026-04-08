'use client'
// ─── LockedBadge ──────────────────────────────────────────────────────────────
// Inline "Pro" badge or locked-state banner for gated features.

import { Lock } from 'lucide-react'
import { useSubscription } from '@/lib/revenuecat/SubscriptionProvider'
import type { PaywallTrigger } from '@/lib/revenuecat/paywallTriggers'

interface BadgeProps {
  /** Optional: open paywall on tap */
  trigger?: PaywallTrigger
  className?: string
}

/** Small pill badge — use inline next to feature labels */
export function ProBadge({ trigger, className = '' }: BadgeProps) {
  const { openPaywall } = useSubscription()
  return (
    <span
      role={trigger ? 'button' : undefined}
      onClick={trigger ? () => openPaywall(trigger) : undefined}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#121212] bg-[#FFFFFF] rounded-full px-2 py-0.5 select-none ${trigger ? 'cursor-pointer' : ''} ${className}`}
    >
      <Lock size={9} strokeWidth={2.5} />
      Pro
    </span>
  )
}

interface BannerProps {
  headline:   string
  cta?:       string
  trigger:    PaywallTrigger
  className?: string
}

/** Full-width locked-state banner with CTA */
export function LockedBanner({ headline, cta = 'Ver planes', trigger, className = '' }: BannerProps) {
  const { openPaywall } = useSubscription()
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border border-[#FFFFFF] bg-[#F5F5FF] px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center flex-shrink-0">
          <Lock size={14} className="text-[#121212]" />
        </div>
        <p className="text-[14px] text-[#121212] font-medium">{headline}</p>
      </div>
      <button
        onClick={() => openPaywall(trigger)}
        className="text-[13px] font-semibold text-[#121212] whitespace-nowrap"
      >
        {cta}
      </button>
    </div>
  )
}
