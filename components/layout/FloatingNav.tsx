'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Plus, X } from 'lucide-react'
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
  } | null>(null)

  function openPicker() {
    haptics.tap('medium')
    if (fabRef.current) {
      const r = fabRef.current.getBoundingClientRect()
      setMorphOrigin({ top: r.top, left: r.left, width: r.width, height: r.height })
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
      <div className="lg:hidden fixed bottom-0 right-0 z-50 pointer-events-none"
        style={{ transform: 'translateY(var(--surface-y, 0px))' }}
      >
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

      {/* Step 1 — Platform picker.
          Custom presentation: the + FAB morphs into a black fullscreen
          background (via the measured morphOrigin), then a white sheet
          with the picker slides up on top of it. Closing reverses both
          animations so the black surface collapses back into the FAB. */}
      <AnimatePresence>
        {step === 'pick' && morphOrigin && (
          <>
            {/* Morphing black backdrop — expands from the FAB */}
            <motion.div
              key="picker-morph-bg"
              className="fixed bg-[#121212] pointer-events-auto"
              style={{ zIndex: 500 }}
              initial={{
                top: morphOrigin.top,
                left: morphOrigin.left,
                width: morphOrigin.width,
                height: morphOrigin.height,
                borderRadius: morphOrigin.width / 2,
              }}
              animate={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 0,
              }}
              exit={{
                top: morphOrigin.top,
                left: morphOrigin.left,
                width: morphOrigin.width,
                height: morphOrigin.height,
                borderRadius: morphOrigin.width / 2,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.95 }}
              onClick={close}
              aria-hidden="true"
            />

            {/* White content sheet — slides up on top of the black bg */}
            <motion.div
              key="picker-sheet"
              className="fixed left-0 right-0 bg-white dark:bg-[#1C1C1E] flex flex-col max-h-[82dvh]"
              style={{
                zIndex: 501,
                bottom: 'calc(env(safe-area-inset-bottom) * -1)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                borderRadius: '32px 32px 0 0',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 36,
                mass: 0.95,
                delay: 0.08,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grabber */}
              <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1.5">
                <div className="w-9 h-[5px] rounded-full bg-[#D4D4D4] dark:bg-[#48484A]" />
              </div>

              {/* Title + close */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3">
                <h2 className="text-[17px] font-semibold text-[#121212] dark:text-[#F2F2F7]">
                  {t('sheets.createNew')}
                </h2>
                <button
                  onClick={close}
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-[#616161] dark:text-[#AEAEB2] transition-colors active:bg-[#EBEBEB] dark:active:bg-[#3A3A3C]"
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable list */}
              <div
                className="flex-1 overflow-x-hidden min-h-0"
                style={{
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                <PlatformPicker onSelect={handleSelect} />
              </div>

              {/* Footer CTAs */}
              <div className="flex-shrink-0 flex gap-3 px-5 pt-4 pb-4 border-t border-[#F0F0F0] dark:border-[#2C2C2E]">
                <button
                  onClick={() => setStep('gmail')}
                  className="flex-1 h-12 rounded-full text-sm font-semibold text-[#121212] dark:text-[#F2F2F7] border border-[#121212] dark:border-[#F2F2F7] bg-transparent flex items-center justify-center active:bg-[#F0F0F0] dark:active:bg-[#2C2C2E] transition-colors"
                >
                  {t('picker.searchGmail')}
                </button>
                <button
                  onClick={() => handleSelect(null)}
                  className="flex-1 h-12 rounded-full text-sm font-semibold text-white bg-[#121212] flex items-center justify-center active:bg-[#333333] transition-colors"
                >
                  {t('picker.enterManually')}
                </button>
              </div>
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
