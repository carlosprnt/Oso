'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import CalendarView from '@/components/calendar/CalendarView'
import type { SubscriptionWithCosts } from '@/types'

export default function CalendarModalButton({
  subscriptions,
}: {
  subscriptions: SubscriptionWithCosts[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F5F5F5] dark:bg-[#2C2C2E] text-[#424242] dark:text-[#AEAEB2] active:opacity-70 transition-opacity"
        aria-label="Abrir calendario"
      >
        <CalendarDays size={16} strokeWidth={2} />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} height="full">
        <div className="px-5 pt-3 pb-5">
          <CalendarView subscriptions={subscriptions} />
        </div>
      </BottomSheet>
    </>
  )
}
