'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Plus, X, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from '@/components/subscriptions/PlatformPicker'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import GmailSubscriptionSearchSheet from '@/components/subscriptions/GmailSubscriptionSearchSheet'
import { useT } from '@/lib/i18n/LocaleProvider'
import { useTheme } from '@/components/ui/ThemeProvider'
import haptics from '@/lib/haptics'
import type { PlatformPreset } from '@/lib/constants/platforms'

type Step = 'closed' | 'pick' | 'form' | 'gmail'

const BTN_H = 48  // reference height for bottom offset

export default function FloatingNav() {
  const t = useT()
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [step, setStep] = useState<Step>('closed')
  const [platform, setPlatform] = useState<PlatformPreset | null>(null)

  // Morph origin — measured from the + FAB at the moment the user taps
  // it, so the circular background can expand from that exact point.
  const fabRef = useRef<HTMLButtonElement>(null)
  const [morphOrigin, setMorphOrigin] = useState<{
    top: number
    left: number
    width: number
    height: number
    bottom: number
    right: number
  } | null>(null)

  function openPicker() {
    haptics.tap('medium')
    if (fabRef.current) {
      const r = fabRef.current.getBoundingClientRect()
      setMorphOrigin({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        // Compute bottom/right for the expand-from-corner animation
        bottom: window.innerHeight - r.bottom,
        right: window.innerWidth - r.right,
      })
    }
    setStep('pick')
  }

  useEffect(() => {
    try {
      const pending = localStorage.getItem('perezoso_gmail_pending')
      if (pending === '1') {
        localStorage.removeItem('perezoso_gmail_pending')
        const timer = setTimeout(() => setStep('gmail'), 350)
        return () => clearTimeout(timer)
      }
    } catch { /* localStorage unavailable */ }
  }, [])

  function handleSelect(p: PlatformPreset | null) {
    setPlatform(p)
    setStep('form')
  }
  function close() {
    setStep('closed')
    setPlatform(null)
  }

  const hideNav = pathname === '/settings' || pathname.startsWith('/settings/')

  // Bottom offset: 20px + safe-area
  const bottomOffset = 'calc(env(safe-area-inset-bottom) - 20px)'

  return (
    <>
      {/* ── Floating nav — mobile only, hidden on settings ────────────────── */}
      {/* ── Floating + button — mobile only, hidden on settings ──── */}
      {!hideNav && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ transform: 'translateY(var(--surface-y, 0px))' }}
      >
        {/* Calendar button — bottom left */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('oso:open-calendar'))}
          aria-label="Calendar"
          className="absolute left-4 pointer-events-auto flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
          style={{
            width: 48,
            height: 48,
            bottom: `calc(${bottomOffset} + 8px)`,
          }}
        >
          <CalendarDays size={19} strokeWidth={2} className="text-[#333333] dark:text-[#F2F2F7]" />
        </button>

        {/* + FAB — bottom right */}
        <motion.button
          ref={fabRef}
          onClick={openPicker}
          aria-label="Add subscription"
          className="absolute right-4 pointer-events-auto flex items-center justify-center rounded-full bg-[#121212]"
          style={{
            width: 56,
            height: 56,
            bottom: `calc(${bottomOffset} + 4px)`,
            opacity: step === 'pick' ? 0 : 1,
            pointerEvents: step === 'pick' ? 'none' : 'auto',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ opacity: { duration: 0.15 } }}
        >
          <Plus size={22} color="#ffffff" strokeWidth={2.5} />
        </motion.button>
      </div>
      )}

      {/* Step 1 — Platform picker dropdown.
          The + FAB circle expands into a black rounded-rect dropdown
          anchored from the FAB's corner. The dropdown IS the expanded
          circle — no separate backdrop or white sheet. Content is
          white-on-black. Width: viewport − 40 px (20 px margin each
          side). Height: 50 vh. */}
      <AnimatePresence>
        {step === 'pick' && morphOrigin && (
          <>
            {/* Invisible backdrop to catch taps outside the dropdown */}
            <motion.div
              key="picker-backdrop"
              className="fixed inset-0 z-[499]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              style={{ background: 'rgba(0,0,0,0.3)' }}
            />

            {/* Expanding dropdown — morphs from the FAB circle */}
            <motion.div
              key="picker-dropdown"
              className="fixed z-[500] bg-[#121212] flex flex-col overflow-hidden dark"
              style={{ originX: 1, originY: 1 }}
              initial={{
                bottom: morphOrigin.bottom,
                right: morphOrigin.right,
                width: morphOrigin.width,
                height: morphOrigin.height,
                borderRadius: morphOrigin.width / 2,
              }}
              animate={{
                bottom: morphOrigin.bottom,
                right: 20,
                width: 'calc(100vw - 40px)',
                height: '50vh',
                borderRadius: 24,
              }}
              exit={{
                bottom: morphOrigin.bottom,
                right: morphOrigin.right,
                width: morphOrigin.width,
                height: morphOrigin.height,
                borderRadius: morphOrigin.width / 2,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Inner content — fades in after expand starts */}
              <motion.div
                className="flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                {/* Header: title + close X */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                  <h2 className="text-[17px] font-semibold text-white">
                    {t('sheets.createNew')}
                  </h2>
                  <button
                    onClick={close}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 active:bg-white/20 transition-colors"
                    aria-label="Close"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Scrollable platform list */}
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-2"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                  }}
                >
                  <PlatformPicker onSelect={handleSelect} />
                </div>

                {/* Footer: add manually */}
                <div className="flex-shrink-0 px-5 pt-3 pb-5">
                  <button
                    onClick={() => handleSelect(null)}
                    className="w-full h-12 rounded-full text-sm font-semibold text-[#121212] bg-white flex items-center justify-center active:bg-white/90 transition-colors"
                  >
                    {t('picker.enterManually')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Step 2 — Form */}
      <BottomSheet isOpen={step === 'form'} onClose={close} height="full">
        <SubscriptionForm mode="create" platformPreset={platform ?? undefined} onCancel={close} />
      </BottomSheet>

      {/* Gmail search sheet */}
      <GmailSubscriptionSearchSheet isOpen={step === 'gmail'} onClose={close} />
    </>
  )
}
