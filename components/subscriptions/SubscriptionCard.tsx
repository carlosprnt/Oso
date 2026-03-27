'use client'

import Link from 'next/link'
import SubscriptionAvatar from './SubscriptionAvatar'
import { formatCurrency } from '@/lib/utils/currency'
import type { SubscriptionWithCosts } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  active:    'Active',
  trial:     'Trial',
  paused:    'Paused',
  cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  active:    '#16A34A',
  trial:     '#D97706',
  paused:    '#9CA3AF',
  cancelled: '#EF4444',
}

interface SubscriptionCardProps {
  subscription: SubscriptionWithCosts
  index?: number
}

export default function SubscriptionCard({ subscription: sub, index = 0 }: SubscriptionCardProps) {
  return (
    <Link href={`/subscriptions/${sub.id}`}>
      <div
        className="
          bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3
          flex items-center gap-3
          hover:border-[#D4D4D4] hover:bg-[#FAFAFA]
          transition-colors duration-150 pressable
          animate-fade-in
        "
        style={{ animationDelay: `${index * 30}ms` }}
      >
        {/* Avatar */}
        <SubscriptionAvatar
          name={sub.name}
          logoUrl={sub.logo_url}
          size="md"
        />

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#121212] truncate leading-snug">
            {sub.name}
          </p>
          <p
            className="text-xs font-medium mt-0.5 leading-snug"
            style={{ color: STATUS_COLOR[sub.status] ?? '#9CA3AF' }}
          >
            {STATUS_LABEL[sub.status] ?? sub.status}
          </p>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-[#121212] tabular-nums leading-snug">
            {formatCurrency(sub.my_monthly_cost, sub.currency)}
          </p>
          <p className="text-xs text-[#A3A3A3] leading-snug">/ mo</p>
        </div>
      </div>
    </Link>
  )
}
