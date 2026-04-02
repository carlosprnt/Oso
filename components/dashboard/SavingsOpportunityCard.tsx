'use client'

import { TrendingDown, Copy, Users, Package } from 'lucide-react'
import SubscriptionAvatar from '@/components/subscriptions/SubscriptionAvatar'
import { resolveSubscriptionLogoUrl } from '@/lib/constants/platforms'
import { formatCurrency } from '@/lib/utils/currency'
import { useT, useLocale } from '@/lib/i18n/LocaleProvider'
import type { SavingsOpportunity } from '@/lib/calculations/savings'

// ─── Icon config per type ─────────────────────────────────────────────────────

function CardIcon({ type }: { type: SavingsOpportunity['type'] }) {
  const configs = {
    switch_to_yearly:   { bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', icon: <TrendingDown size={22} strokeWidth={2} style={{ color: '#059669' }} /> },
    duplicate_category: { bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', icon: <Copy         size={22} strokeWidth={2} style={{ color: '#D97706' }} /> },
    shared_plan:        { bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)', icon: <Users        size={22} strokeWidth={2} style={{ color: '#2563EB' }} /> },
    bundle:             { bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', icon: <Package      size={22} strokeWidth={2} style={{ color: '#7C3AED' }} /> },
  }
  const cfg = configs[type]
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg }}>
      {cfg.icon}
    </div>
  )
}

// ─── Title + desc strings ─────────────────────────────────────────────────────

function useCardContent(opp: SavingsOpportunity) {
  const t      = useT()
  const locale = useLocale()
  const saving = formatCurrency(opp.estimatedMonthlySaving, opp.currency, locale)

  switch (opp.type) {
    case 'switch_to_yearly': {
      const name = opp.subscriptionName ?? ''
      return {
        title:   t('savings.switchToYearlyTitle').replace('{name}', name),
        desc:    t('savings.cardSave').replace('{amount}', saving),
        logoUrl: resolveSubscriptionLogoUrl(name, opp.subscriptionLogoUrl ?? null),
      }
    }
    case 'duplicate_category': {
      const catKey   = `categories.${opp.category}` as Parameters<typeof t>[0]
      const catLabel = opp.category ? t(catKey) : ''
      return {
        title:   t('savings.duplicateCategoryTitle').replace('{category}', catLabel),
        desc:    t('savings.cardSave').replace('{amount}', saving),
        logoUrl: null,
      }
    }
    case 'shared_plan': {
      const name = opp.subscriptionName ?? ''
      return {
        title:   t('savings.sharedPlanTitle').replace('{name}', name),
        desc:    t('savings.cardSave').replace('{amount}', saving),
        logoUrl: resolveSubscriptionLogoUrl(name, opp.subscriptionLogoUrl ?? null),
      }
    }
    case 'bundle':
      return {
        title:   t('savings.bundleTitle'),
        desc:    t('savings.cardSave').replace('{amount}', saving),
        logoUrl: null,
      }
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  opportunity: SavingsOpportunity
  onTap: () => void
}

export default function SavingsOpportunityCard({ opportunity, onTap }: Props) {
  const t                        = useT()
  const { title, desc, logoUrl } = useCardContent(opportunity)
  const showLogo = logoUrl && (opportunity.type === 'switch_to_yearly' || opportunity.type === 'shared_plan')

  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3.5 bg-white dark:bg-[#1C1C1E] rounded-[20px] px-4 py-4 text-left active:scale-[0.98] transition-transform"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      aria-label={title}
    >
      {/* Icon: subscription logo for per-sub types, category icon otherwise */}
      {showLogo ? (
        <SubscriptionAvatar name={opportunity.subscriptionName ?? ''} logoUrl={logoUrl} size="md" corner="rounded-[10px]" />
      ) : (
        <CardIcon type={opportunity.type} />
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-snug truncate">{title}</p>
        <p className="text-[13px] text-[#737373] dark:text-[#8E8E93] mt-0.5 leading-snug">{desc}</p>
      </div>

      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="flex-shrink-0 text-[#C7C7CC] dark:text-[#636366]">
        <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
