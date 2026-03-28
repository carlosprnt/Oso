'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from './PlatformPicker'
import SubscriptionForm from './SubscriptionForm'
import type { PlatformPreset } from '@/lib/constants/platforms'

type Step = 'closed' | 'pick' | 'form'

export default function AddSubscriptionFlow() {
  const [step, setStep] = useState<Step>('closed')
  const [platform, setPlatform] = useState<PlatformPreset | null>(null)

  function handleSelect(p: PlatformPreset | null) {
    setPlatform(p)
    setStep('form')
  }

  function close() {
    setStep('closed')
    setPlatform(null)
  }

  return (
    <>
      <button
        onClick={() => setStep('pick')}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121212] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-colors pressable"
      >
        <Plus size={15} />
        Add
      </button>

      {/* Step 1 — Platform list (no search) */}
      <BottomSheet isOpen={step === 'pick'} onClose={close} title="Add subscription" height="tall">
        <PlatformPicker onSelect={handleSelect} />
      </BottomSheet>

      {/* Step 2 — Form */}
      <BottomSheet
        isOpen={step === 'form'}
        onClose={close}
        title={platform ? platform.name : 'New subscription'}
        height="tall"
      >
        <SubscriptionForm mode="create" platformPreset={platform ?? undefined} onCancel={close} />
      </BottomSheet>
    </>
  )
}
