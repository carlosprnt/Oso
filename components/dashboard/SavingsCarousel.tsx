'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InsightCard from './SavingsOpportunityCard'
import InsightAllSheet from './InsightAllSheet'
import SavingsDetailSheet from './SavingsDetailSheet'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { SavingsOpportunity } from '@/lib/calculations/savings'

export type CarouselItem =
  | { kind: 'reminder'; annualCount: number }
  | { kind: 'savings'; opportunity: SavingsOpportunity }

// How many ghost cards peek below the front
const PEEK_COUNT = 2

// ─── Stacked deck ─────────────────────────────────────────────────────────────

interface Props {
  items: CarouselItem[]
  onReminderActivate: () => void
  onAllDismissed: () => void
}

export default function SavingsCarousel({ items, onReminderActivate, onAllDismissed }: Props) {
  const t = useT()
  const [dismissed,  setDismissed]  = useState<Set<number>>(new Set())
  const [detail,     setDetail]     = useState<SavingsOpportunity | null>(null)
  const [showAll,    setShowAll]    = useState(false)
  const [activeStart, setActiveStart] = useState(0)

  // Non-dismissed items (original index preserved)
  const visible = items
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => !dismissed.has(i))

  function dismiss(originalIdx: number) {
    const next = new Set(dismissed).add(originalIdx)
    setDismissed(next)
    if (items.filter((_, i) => !next.has(i)).length === 0) onAllDismissed()
  }

  function handleActivate() {
    onReminderActivate()
    const idx = items.findIndex(it => it.kind === 'reminder')
    if (idx !== -1) dismiss(idx)
  }

  function cycleToFront(fromVisibleIdx: number) {
    if (fromVisibleIdx === 0) return
    setActiveStart(prev => (prev + fromVisibleIdx) % visible.length)
  }

  // Rotate visible so front card = activeStart
  const rotated = visible.length === 0 ? [] : [
    ...visible.slice(activeStart % visible.length),
    ...visible.slice(0, activeStart % visible.length),
  ]

  const frontEntry  = rotated[0]
  const peekEntries = rotated.slice(1, 1 + PEEK_COUNT)
  const extraCount  = visible.length - 1 - PEEK_COUNT  // beyond peek cards

  // ── Render front card ─────────────────────────────────────────────────────
  function renderCard(entry: { item: CarouselItem; i: number }) {
    const { item, i } = entry
    if (item.kind === 'reminder') {
      return (
        <InsightCard
          kind="reminder"
          annualCount={item.annualCount}
          onActivate={handleActivate}
          onDismiss={() => dismiss(i)}
        />
      )
    }
    return (
      <InsightCard
        kind="savings"
        opportunity={item.opportunity}
        onTap={() => setDetail(item.opportunity)}
        onDismiss={() => dismiss(i)}
      />
    )
  }

  if (visible.length === 0) return null

  return (
    <>
      <AnimatePresence onExitComplete={onAllDismissed}>
        <motion.div
          key="insight-stack-wrap"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide">
              {t('savings.allTitle')}
            </p>
            {visible.length > 1 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-[13px] font-medium text-[#3D3BF3] dark:text-[#8B89FF]"
              >
                {t('savings.viewAll')}
              </button>
            )}
          </div>

          {/* Stacked deck */}
          <div
            className="relative w-full"
            style={{ paddingBottom: Math.min(peekEntries.length, PEEK_COUNT) * 10 }}
          >
            {/* Peek ghost cards — rendered bottom-up */}
            {peekEntries.map((entry, peekIdx) => {
              const depth   = peekIdx + 1
              const offsetY = depth * 10
              const scale   = 1 - depth * 0.03
              const opacity = 1 - depth * 0.15
              return (
                <div
                  key={entry.i}
                  className="absolute inset-x-0 top-0 rounded-[20px] bg-white dark:bg-[#1C1C1E] cursor-pointer"
                  style={{
                    transform: `translateY(${offsetY}px) scale(${scale})`,
                    transformOrigin: 'bottom center',
                    opacity,
                    zIndex: PEEK_COUNT - peekIdx,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                    height: '100%',
                    minHeight: 110,
                  }}
                  onClick={() => cycleToFront(peekIdx + 1)}
                  role="button"
                  tabIndex={0}
                  aria-label={t('savings.viewAll')}
                  onKeyDown={e => e.key === 'Enter' && cycleToFront(peekIdx + 1)}
                />
              )
            })}

            {/* Extra count badge on last peek card */}
            {extraCount > 0 && peekEntries.length >= PEEK_COUNT && (
              <div
                className="absolute bottom-0 inset-x-0 flex items-end justify-center pb-1.5"
                style={{ zIndex: 1 }}
              >
                <span
                  className="text-[11px] font-bold text-[#3D3BF3] dark:text-[#8B89FF] px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(61,59,243,0.10)' }}
                >
                  +{extraCount} más
                </span>
              </div>
            )}

            {/* Front card */}
            <AnimatePresence mode="wait">
              {frontEntry && (
                <motion.div
                  key={frontEntry.i}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.95 }}
                  transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: 'relative', zIndex: PEEK_COUNT + 1 }}
                >
                  {renderCard(frontEntry)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          {visible.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {visible.slice(0, Math.min(visible.length, 6)).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width:  idx === (activeStart % visible.length) ? 16 : 6,
                    height: 6,
                    background: idx === (activeStart % visible.length)
                      ? '#3D3BF3'
                      : 'rgba(142,142,147,0.35)',
                  }}
                />
              ))}
              {visible.length > 6 && (
                <span className="text-[10px] text-[#8E8E93]">+{visible.length - 6}</span>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <SavingsDetailSheet opportunity={detail} onClose={() => setDetail(null)} />

      <InsightAllSheet
        isOpen={showAll}
        onClose={() => setShowAll(false)}
        items={items}
        dismissed={dismissed}
        onDismiss={dismiss}
        onDetail={opp => { setDetail(opp); setShowAll(false) }}
        onActivate={handleActivate}
      />
    </>
  )
}
