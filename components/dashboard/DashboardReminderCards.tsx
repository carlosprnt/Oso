'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import SlothReminderCard from './SlothReminderCard'
import SavingsCarousel from './SavingsCarousel'
import { detectSavingsOpportunities } from '@/lib/calculations/savings'
import type { SubscriptionWithCosts } from '@/types'

type Phase = 'reminder' | 'savings' | 'done'

export default function DashboardReminderCards({ subscriptions }: { subscriptions: SubscriptionWithCosts[] }) {
  const opportunities = useMemo(() => detectSavingsOpportunities(subscriptions), [subscriptions])
  const [phase, setPhase] = useState<Phase>('reminder')

  // Called by SlothReminderCard's onExitComplete after its 0.42s exit animation
  function onReminderExited() {
    setPhase(opportunities.length > 0 ? 'savings' : 'done')
  }

  if (phase === 'done') return null

  return (
    <>
      {phase === 'reminder' && (
        <SlothReminderCard onDismiss={onReminderExited} />
      )}

      <AnimatePresence>
        {phase === 'savings' && opportunities.length > 0 && (
          <SavingsCarousel
            key="savings"
            opportunities={opportunities}
            onAllDismissed={() => setPhase('done')}
          />
        )}
      </AnimatePresence>
    </>
  )
}
