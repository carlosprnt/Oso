'use client'

import { useState, useEffect } from 'react'
import { getCategoryMeta } from '@/lib/constants/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { Category } from '@/types'

const COLORS: Record<string, string> = {
  streaming:    '#F87171',
  music:        '#4ADE80',
  productivity: '#60A5FA',
  cloud:        '#38BDF8',
  ai:           '#A78BFA',
  health:       '#34D399',
  gaming:       '#FB923C',
  education:    '#FBBF24',
  mobility:     '#F472B6',
  home:         '#FCD34D',
  other:        '#9CA3AF',
}

interface CategoryRow {
  category: string
  monthly_cost: number
  pct: number
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  start: number, end: number,
): string {
  const os = polarToCartesian(cx, cy, outerR, start)
  const oe = polarToCartesian(cx, cy, outerR, end)
  const is = polarToCartesian(cx, cy, innerR, start)
  const ie = polarToCartesian(cx, cy, innerR, end)
  const large = end - start > 180 ? 1 : 0
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ')
}

export default function TopCategoriesSection({ categories }: { categories: CategoryRow[] }) {
  const t = useT()
  const [active, setActive] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (categories.length === 0) return null

  const total = categories.reduce((s, c) => s + c.monthly_cost, 0)

  // Build segments: distribute 360° minus small gaps
  const GAP = categories.length > 1 ? 3 : 0
  const totalSweep = 360 - categories.length * GAP
  let cursor = 0
  const segments = categories.map((cat) => {
    const sweep = Math.max(1, (cat.pct / 100) * totalSweep)
    const start = cursor
    const end = cursor + sweep
    cursor = end + GAP
    return { ...cat, start, end, color: COLORS[cat.category] ?? '#9CA3AF' }
  })

  const sel = active !== null ? segments[active] : null
  const centerAmount = sel
    ? formatCurrency(sel.monthly_cost, 'EUR')
    : formatCurrency(total, 'EUR')
  const centerLabel  = sel
    ? t(`categories.${sel.category}` as Parameters<typeof t>[0])
    : t('dashboard.perMonth')

  return (
    <div>
      {/* Donut */}
      <div className="flex justify-center mb-5">
        <svg
          viewBox="0 0 200 200"
          className="w-44 h-44 text-[#121212] dark:text-[#F2F2F7]"
          style={{
            overflow: 'visible',
            transform: mounted ? 'scale(1)' : 'scale(0.82)',
            opacity: mounted ? 1 : 0,
            transition: 'transform 0.45s cubic-bezier(0.2, 0, 0, 1), opacity 0.35s ease',
          }}
        >
          {segments.map((seg, i) => {
            const isActive = active === i
            const outerR = isActive ? 90 : 82
            const innerR = 50
            return (
              <path
                key={seg.category}
                d={arcPath(100, 100, outerR, innerR, seg.start, seg.end)}
                fill={seg.color}
                opacity={active !== null && !isActive ? 0.3 : 1}
                style={{
                  transition: 'opacity 0.18s ease, d 0.18s ease',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                role="button"
                tabIndex={0}
                aria-label={`${t(`categories.${seg.category}` as Parameters<typeof t>[0])}: ${formatCurrency(seg.monthly_cost, 'EUR')}`}
                onKeyDown={e => e.key === 'Enter' && setActive(active === i ? null : i)}
              />
            )
          })}

          {/* Center amount */}
          <text
            x="100"
            y="96"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontSize: '15px', fontWeight: 700 }}
          >
            {centerAmount}
          </text>
          {/* Center label */}
          <text
            x="100"
            y="114"
            textAnchor="middle"
            fill="#8E8E93"
            style={{ fontSize: '10px', fontWeight: 500 }}
          >
            {centerLabel}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-0.5">
        {segments.map((seg, i) => {
          const meta = getCategoryMeta(seg.category as Category)
          const Icon = meta.icon
          const isActive = active === i
          return (
            <button
              key={seg.category}
              className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors text-left"
              style={{ backgroundColor: isActive ? `${seg.color}1A` : 'transparent' }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-[13px] text-[#121212] dark:text-[#F2F2F7] truncate">
                {t(`categories.${seg.category}` as Parameters<typeof t>[0])}
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-[#121212] dark:text-[#F2F2F7]">
                {formatCurrency(seg.monthly_cost, 'EUR')}
              </span>
              <span className="text-[11px] text-[#8E8E93] w-8 text-right flex-shrink-0">
                {Math.round(seg.pct)}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
