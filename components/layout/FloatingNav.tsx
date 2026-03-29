'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Plus } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from '@/components/subscriptions/PlatformPicker'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import GmailSubscriptionSearchSheet from '@/components/subscriptions/GmailSubscriptionSearchSheet'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { PlatformPreset } from '@/lib/constants/platforms'

type Step = 'closed' | 'pick' | 'form' | 'gmail'

function TagHeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <path d="M8.5 8.5c.5-1 2-1 2 .5 0 1-2 2-2 2s-2-1-2-2c0-1.5 1.5-1.5 2-.5z" strokeWidth="1.5" />
    </svg>
  )
}

export default function FloatingNav() {
  const t = useT()
  const pathname = usePathname()
  const [step, setStep] = useState<Step>('closed')
  const [platform, setPlatform] = useState<PlatformPreset | null>(null)

  useEffect(() => {
    const pending = localStorage.getItem('perezoso_gmail_pending')
    if (pending === '1') {
      localStorage.removeItem('perezoso_gmail_pending')
      const timer = setTimeout(() => setStep('gmail'), 350)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleSelect(p: PlatformPreset | null) {
    setPlatform(p)
    setStep('form')
  }

  function close() {
    setStep('closed')
    setPlatform(null)
  }

  const isDash = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isSubs = pathname === '/subscriptions' || pathname.startsWith('/subscriptions/')

  return (
    <>
      {/* ── Floating nav — mobile only ─────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{ height: 64, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Wrapper — anchors the + button relative to the pill */}
        <div className="relative pointer-events-auto">

          {/* Pill nav container: 152px wide, 8px padding, 8px gap */}
          <div
            className="flex items-center gap-2 rounded-full"
            style={{
              width: 152,
              height: 64,
              padding: 8,
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Dashboard */}
            <Link href="/dashboard" aria-label={t('nav.dashboard')}>
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-150"
                style={{
                  width: 58,
                  height: 48,
                  background: isDash ? '#111111' : '#F3F3F3',
                }}
              >
                <LayoutGrid
                  size={20}
                  strokeWidth={isDash ? 2.5 : 2}
                  color={isDash ? '#ffffff' : '#111111'}
                />
              </div>
            </Link>

            {/* Subscriptions */}
            <Link href="/subscriptions" aria-label={t('nav.subscriptions')}>
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-150"
                style={{
                  width: 58,
                  height: 48,
                  background: isSubs ? '#111111' : '#F3F3F3',
                  color: isSubs ? '#ffffff' : '#111111',
                }}
              >
                <TagHeartIcon active={isSubs} />
              </div>
            </Link>
          </div>

          {/* + button: 48px, 16px to the right of the pill, vertically centered */}
          <button
            onClick={() => setStep('pick')}
            aria-label="Add subscription"
            className="absolute -translate-y-1/2 flex items-center justify-center rounded-full bg-[#3D3BF3] active:scale-95 transition-transform duration-100"
            style={{
              width: 48,
              height: 48,
              left: 'calc(100% + 16px)',
              top: '50%',
              boxShadow: '0 4px 16px rgba(61,59,243,0.40)',
            }}
          >
            <Plus size={22} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* Step 1 — Platform picker */}
      <BottomSheet isOpen={step === 'pick'} onClose={close} title={t('sheets.createNew')} height="tall">
        <PlatformPicker onSelect={handleSelect} onGmailSearch={() => setStep('gmail')} />
      </BottomSheet>

      {/* Step 2 — Form */}
      <BottomSheet isOpen={step === 'form'} onClose={close} title={t('sheets.createNew')} height="tall">
        <SubscriptionForm mode="create" platformPreset={platform ?? undefined} onCancel={close} />
      </BottomSheet>

      {/* Gmail search sheet */}
      <GmailSubscriptionSearchSheet isOpen={step === 'gmail'} onClose={close} />
    </>
  )
}
