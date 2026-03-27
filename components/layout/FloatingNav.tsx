'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, CreditCard } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from '@/components/subscriptions/PlatformPicker'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import type { PlatformPreset } from '@/lib/constants/platforms'

type AddStep = 'closed' | 'pick-platform' | 'form'

export default function FloatingNav() {
  const pathname = usePathname()
  const [addStep, setAddStep] = useState<AddStep>('closed')
  const [platform, setPlatform] = useState<PlatformPreset | null>(null)

  function handlePlatformSelect(p: PlatformPreset | null) {
    setPlatform(p)
    setAddStep('form')
  }

  function closeSheets() {
    setAddStep('closed')
    setPlatform(null)
  }

  const isDash  = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isSubs  = pathname === '/subscriptions' || pathname.startsWith('/subscriptions/')

  return (
    <>
      {/* ── Floating pill nav — mobile only ───────────────────── */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="
            flex items-center gap-2
            bg-white/90 backdrop-blur-md
            rounded-full px-3 py-2.5
            border border-[#E0E0E0]
            shadow-[0_4px_24px_rgba(0,0,0,0.14)]
          "
        >
          {/* Dashboard */}
          <Link href="/dashboard">
            <div
              className={`
                w-11 h-11 rounded-full flex items-center justify-center transition-colors
                ${isDash ? 'bg-[#E8E8E8]' : 'hover:bg-[#F5F5F5]'}
              `}
            >
              <LayoutDashboard
                size={20}
                strokeWidth={isDash ? 2.5 : 2}
                className={isDash ? 'text-[#121212]' : 'text-[#888888]'}
              />
            </div>
          </Link>

          {/* Add — prominent blue circle */}
          <button
            onClick={() => setAddStep('pick-platform')}
            className="
              w-14 h-14 rounded-full
              bg-[#3D3BF3]
              flex items-center justify-center
              shadow-[0_2px_12px_rgba(61,59,243,0.4)]
              active:scale-95 transition-transform duration-100
            "
          >
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          </button>

          {/* Subscriptions */}
          <Link href="/subscriptions">
            <div
              className={`
                w-11 h-11 rounded-full flex items-center justify-center transition-colors
                ${isSubs ? 'bg-[#E8E8E8]' : 'hover:bg-[#F5F5F5]'}
              `}
            >
              <CreditCard
                size={20}
                strokeWidth={isSubs ? 2.5 : 2}
                className={isSubs ? 'text-[#121212]' : 'text-[#888888]'}
              />
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Add subscription sheets ────────────────────────────── */}
      <BottomSheet
        isOpen={addStep === 'pick-platform'}
        onClose={closeSheets}
        title="Add subscription"
        height="tall"
      >
        <PlatformPicker onSelect={handlePlatformSelect} />
      </BottomSheet>

      <BottomSheet
        isOpen={addStep === 'form'}
        onClose={closeSheets}
        title={platform ? platform.name : 'New subscription'}
        height="tall"
      >
        <SubscriptionForm
          mode="create"
          platformPreset={platform ?? undefined}
          onCancel={closeSheets}
        />
      </BottomSheet>
    </>
  )
}
