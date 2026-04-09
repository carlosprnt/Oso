'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import BottomSheet from '@/components/ui/BottomSheet'
import PlatformPicker from '@/components/subscriptions/PlatformPicker'
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm'
import GmailSubscriptionSearchSheet from '@/components/subscriptions/GmailSubscriptionSearchSheet'
import UserAvatarMenu from '@/components/dashboard/UserAvatarMenu'
import { useT } from '@/lib/i18n/LocaleProvider'
import { useTheme } from '@/components/ui/ThemeProvider'
import haptics from '@/lib/haptics'
import type { PlatformPreset } from '@/lib/constants/platforms'

type Step = 'closed' | 'pick' | 'form' | 'gmail'

const BTN_W    = 72   // nav button width  (Subs / Mis gastos)
const BTN_H    = 48   // nav button height (Subs / Mis gastos)
const AVATAR_S = 40   // avatar slot side — matches UserAvatarMenu's 40x40 button
const PAD      = 8    // pill padding
const GAP      = 8    // gap between buttons

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
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [step, setStep] = useState<Step>('closed')
  const [platform, setPlatform] = useState<PlatformPreset | null>(null)

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

  const isDash = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isSubs = pathname === '/subscriptions' || pathname.startsWith('/subscriptions/')
  const hideNav = pathname === '/settings' || pathname.startsWith('/settings/')

  // SubscriptionsView broadcasts its count via a custom event so we can
  // emphasize the "+" CTA without a second Supabase roundtrip from here.
  const [hasNoSubs, setHasNoSubs] = useState(false)
  useEffect(() => {
    function onCount(e: Event) {
      const count = (e as CustomEvent<number>).detail
      setHasNoSubs(count === 0)
    }
    window.addEventListener('perezoso:subs-count', onCount)
    return () => window.removeEventListener('perezoso:subs-count', onCount)
  }, [])

  const emphasizeAdd = isSubs && hasNoSubs

  // x offset of the sliding bg: Subscriptions=0, Dashboard=1
  const bgX = isDash ? BTN_W + GAP : 0

  // Icon colors depend on dark mode
  const activeIconColor = isDarkMode ? '#121212' : '#ffffff'
  const inactiveIconColor = isDarkMode ? '#AEAEB2' : '#121212'

  // Bottom offset: 20px + safe-area
  const bottomOffset = 'calc(env(safe-area-inset-bottom) - 20px)'

  return (
    <>
      {/* ── Floating nav — mobile only, hidden on settings ────────────────── */}
      {!hideNav && (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ height: `calc(${BTN_H + PAD * 2}px + env(safe-area-inset-bottom))` }}
      >
        {/* Pill — left-aligned at 20px, 16px from bottom */}
        <div className="absolute left-5 pointer-events-auto"
          style={{ bottom: bottomOffset }}
        >
          <div
            className="floating-pill relative flex items-center rounded-full overflow-hidden"
            style={{
              padding: PAD,
              gap: GAP,
              background: isDarkMode ? 'rgba(28,28,30,0.85)' : 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${isDarkMode ? '#3A3A3C' : '#BCBCBC'}`,
            }}
          >
            {/* Static backgrounds — always visible behind each slot */}
            <div
              className="absolute rounded-full"
              style={{ width: BTN_W, height: BTN_H, top: PAD, left: PAD, backgroundColor: isDarkMode ? '#2C2C2E' : '#EEEEEE' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: BTN_W, height: BTN_H, top: PAD, left: PAD + BTN_W + GAP, backgroundColor: isDarkMode ? '#2C2C2E' : '#EEEEEE' }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: AVATAR_S,
                height: AVATAR_S,
                top: PAD + (BTN_H - AVATAR_S) / 2,
                left: PAD + 2 * (BTN_W + GAP),
                backgroundColor: isDarkMode ? '#2C2C2E' : '#EEEEEE',
              }}
            />

            {/* Sliding indicator — only covers the Subs / Dashboard slots.
                The avatar slot is a menu trigger, not a route tab, so the
                indicator never lands on it. */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: BTN_W, height: BTN_H, top: PAD, left: PAD, zIndex: 1, backgroundColor: isDarkMode ? '#F2F2F7' : '#121212' }}
              animate={{ x: bgX }}
              transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
            />

            {/* Subscriptions button */}
            <Link href="/subscriptions" aria-label={t('nav.subscriptions')}>
              <div className="relative flex items-center justify-center rounded-full"
                style={{ width: BTN_W, height: BTN_H, zIndex: 2, color: isSubs ? activeIconColor : inactiveIconColor }}
              >
                <TagHeartIcon active={false} />
              </div>
            </Link>

            {/* Mis gastos button (formerly "Dashboard") */}
            <Link href="/dashboard" aria-label={t('nav.dashboard')}>
              <div className="relative flex items-center justify-center rounded-full"
                style={{ width: BTN_W, height: BTN_H, zIndex: 2 }}
              >
                <LayoutGrid size={20} strokeWidth={2}
                  color={isDash ? activeIconColor : inactiveIconColor} />
              </div>
            </Link>

            {/* Account menu — third slot, right of Mis gastos. The slot
                is sized exactly to the avatar (40×40) and flex centers
                it vertically within the taller 48 px pill interior. */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: AVATAR_S, height: AVATAR_S, zIndex: 2 }}
            >
              <UserAvatarMenu />
            </div>
          </div>
        </div>

        {/* + button — right edge, 16px margin, same bottom as pill.
            When the user has no subscriptions yet, it scales to 2x to
            emphasize it as the primary call to action. */}
        <motion.button
          onClick={() => { haptics.tap('medium'); setStep('pick') }}
          aria-label="Add subscription"
          className="absolute right-4 pointer-events-auto flex items-center justify-center rounded-full bg-[#121212]"
          style={{
            width: 56,
            height: 56,
            originX: 1,
            originY: 1,
            bottom: `calc(${bottomOffset} + 4px)`,
          }}
          animate={emphasizeAdd ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={
            emphasizeAdd
              ? { duration: 1.6, ease: 'easeInOut', repeat: Infinity }
              : { type: 'spring', stiffness: 300, damping: 22 }
          }
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={22} color="#ffffff" strokeWidth={2.5} />
        </motion.button>
      </nav>
      )}

      {/* Step 1 — Platform picker */}
      <BottomSheet
        isOpen={step === 'pick'}
        onClose={close}
        title={t('sheets.createNew')}
        height="tall"
        footer={
          <div
            className="flex gap-3 px-5 py-4 border-t border-[#F0F0F0] dark:border-[#2C2C2E]"
          >
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
        }
      >
        <PlatformPicker onSelect={handleSelect} />
      </BottomSheet>

      {/* Step 2 — Form */}
      <BottomSheet isOpen={step === 'form'} onClose={close} height="full">
        <SubscriptionForm mode="create" platformPreset={platform ?? undefined} onCancel={close} />
      </BottomSheet>

      {/* Gmail search sheet */}
      <GmailSubscriptionSearchSheet isOpen={step === 'gmail'} onClose={close} />
    </>
  )
}
