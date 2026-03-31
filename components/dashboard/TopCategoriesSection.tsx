'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { getCategoryMeta } from '@/lib/constants/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { useT } from '@/lib/i18n/LocaleProvider'

// Pastel fill colors for category progress bars
const CATEGORY_BAR_COLOR: Record<string, string> = {
  streaming:    '#FCA5A5',
  music:        '#86EFAC',
  productivity: '#93C5FD',
  cloud:        '#7DD3FC',
  ai:           '#C4B5FD',
  health:       '#6EE7B7',
  gaming:       '#FDBA74',
  education:    '#FDE047',
  mobility:     '#F9A8D4',
  home:         '#FCD34D',
  other:        '#D1D5DB',
}

const CATEGORY_ICON_BG: Record<string, string> = {
  streaming:    '#FEE2E2',
  music:        '#DCFCE7',
  productivity: '#DBEAFE',
  cloud:        '#E0F2FE',
  ai:           '#EDE9FE',
  health:       '#D1FAE5',
  gaming:       '#FFEDD5',
  education:    '#FEF9C3',
  mobility:     '#FCE7F3',
  home:         '#FEF3C7',
  other:        '#F3F4F6',
}

interface CategoryRow {
  category: string
  monthly_cost: number
  pct: number
}

interface Props {
  categories: CategoryRow[]
}

function CategoryBar({ category, monthly_cost, pct }: CategoryRow) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const meta = getCategoryMeta(category)
  const Icon = meta.icon
  const barColor = CATEGORY_BAR_COLOR[category] ?? '#D1D5DB'
  const iconBg   = CATEGORY_ICON_BG[category]  ?? '#F3F4F6'

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[15px] text-[#121212] dark:text-[#F2F2F7] font-medium flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={12} style={{ color: barColor }} />
          </span>
          {t(`categories.${category}` as Parameters<typeof t>[0])}
        </span>
        <span className="text-[15px] font-semibold text-[#121212] dark:text-[#F2F2F7] tabular-nums">
          {formatCurrency(monthly_cost, 'EUR')}
        </span>
      </div>
      <div className="h-1 bg-[#F5F5F5] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: inView ? `${Math.min(pct, 100)}%` : 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1], delay: 0.05 }}
        />
      </div>
    </div>
  )
}

export default function TopCategoriesSection({ categories }: Props) {
  return (
    <div className="space-y-3.5">
      {categories.map((row) => (
        <CategoryBar key={row.category} {...row} />
      ))}
    </div>
  )
}
