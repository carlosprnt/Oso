'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SavingsOpportunityCard from './SavingsOpportunityCard'
import SavingsDetailSheet from './SavingsDetailSheet'
import type { SavingsOpportunity } from '@/lib/calculations/savings'

interface Props {
  opportunities: SavingsOpportunity[]
  onAllDismissed: () => void
}

export default function SavingsCarousel({ opportunities, onAllDismissed }: Props) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [detail, setDetail] = useState<SavingsOpportunity | null>(null)

  function dismiss(index: number) {
    const next = new Set(dismissed).add(index)
    setDismissed(next)
    if (next.size >= opportunities.length) onAllDismissed()
  }

  const visible = opportunities.filter((_, i) => !dismissed.has(i))
  const isSingle = visible.length === 1

  return (
    <>
      <AnimatePresence
        mode="wait"
        onExitComplete={() => { if (dismissed.size >= opportunities.length) onAllDismissed() }}
      >
        {visible.length > 0 && (
          <motion.div
            key="carousel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {isSingle ? (
              /* Single card: full-width, no scroll */
              <SavingsOpportunityCard
                opportunity={visible[0]}
                onTap={() => setDetail(visible[0])}
              />
            ) : (
              /* Multiple cards: horizontal carousel with peek */
              <div
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {opportunities.map((opp, i) => {
                  if (dismissed.has(i)) return null
                  return (
                    <div
                      key={i}
                      className="snap-start flex-shrink-0"
                      style={{ width: 'calc(100% - 24px)' }}
                    >
                      <SavingsOpportunityCard
                        opportunity={opp}
                        onTap={() => setDetail(opp)}
                      />
                    </div>
                  )
                })}
                {/* Trailing spacer so last card doesn't peek-cut */}
                <div className="flex-shrink-0 w-3" aria-hidden />
              </div>
            )}

            {/* Dots indicator (only when multiple cards remain) */}
            {visible.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {opportunities.map((_, i) => !dismissed.has(i) && (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#3D3BF3]/30 dark:bg-[#8B89FF]/30"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SavingsDetailSheet opportunity={detail} onClose={() => setDetail(null)} />
    </>
  )
}
