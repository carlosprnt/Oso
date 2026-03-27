'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from './PlatformPicker'
import SubscriptionForm from './SubscriptionForm'
import type { PlatformPreset } from '@/lib/constants/platforms'

type Step = 'closed' | 'pick-platform' | 'form'

export default function AddSubscriptionFlow() {
  const [step, setStep] = useState<Step>('closed')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformPreset | null>(null)

  function handlePlatformSelect(platform: PlatformPreset | null) {
    setSelectedPlatform(platform)
    setStep('form')
  }

  function handleClose() {
    setStep('closed')
    setSelectedPlatform(null)
  }

  return (
    <>
      <button
        onClick={() => setStep('pick-platform')}
        className="
          flex items-center gap-1.5 px-3.5 py-2 rounded-xl
          bg-[#121212] text-white text-sm font-medium
          hover:bg-[#2A2A2A] transition-colors pressable
        "
      >
        <Plus size={15} />
        Add
      </button>

      {/* Step 1 — Platform picker */}
      <BottomSheet
        isOpen={step === 'pick-platform'}
        onClose={handleClose}
        title="Add subscription"
        height="tall"
      >
        <PlatformPicker onSelect={handlePlatformSelect} />
      </BottomSheet>

      {/* Step 2 — Form (with optional platform pre-fill) */}
      <BottomSheet
        isOpen={step === 'form'}
        onClose={handleClose}
        title={selectedPlatform ? selectedPlatform.name : 'New subscription'}
        height="tall"
      >
        <SubscriptionForm
          mode="create"
          platformPreset={selectedPlatform ?? undefined}
          onCancel={handleClose}
        />
      </BottomSheet>
    </>
  )
}
