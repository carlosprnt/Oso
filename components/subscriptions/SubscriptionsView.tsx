'use client'

import { useState, useEffect, useRef } from 'react'
import {
  motion, AnimatePresence, LayoutGroup, useAnimationControls,
  useTransform, useMotionTemplate,
} from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useEffectiveScrollY } from '@/lib/hooks/useEffectiveScrollY'
import SubscriptionDetailOverlay from './SubscriptionDetailOverlay'
import { SlidersHorizontal, CalendarDays, Check, ChevronsUpDown, X, BarChart3 } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import CalendarView from '@/components/calendar/CalendarView'
import QuickAddPlatforms from '@/components/dashboard/QuickAddPlatforms'
import { AnalyticsEvents } from '@/lib/analytics'
import haptics from '@/lib/haptics'
import { formatCurrency } from '@/lib/utils/currency'
import { CATEGORIES } from '@/lib/constants/categories'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { SubscriptionWithCosts, SubscriptionStatus, Category, DashboardStats } from '@/types'

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  active: '#16A34A', trial: '#D97706', paused: '#E07B1A', cancelled: '#EF4444',
}

// ─── Sorting ──────────────────────────────────────────────────────────────────
type SortMode = 'alphabetical' | 'recently_added' | 'recently_updated' | 'price_high' | 'price_low'

function sortSubscriptions(subs: SubscriptionWithCosts[], mode: SortMode): SubscriptionWithCosts[] {
  const s = [...subs]
  switch (mode) {
    case 'alphabetical':
      return s.sort((a, b) => a.name.localeCompare(b.name))
    case 'recently_added':
      return s.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'recently_updated':
      return s.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    case 'price_high':
      return s.sort((a, b) => b.my_monthly_cost - a.my_monthly_cost)
    case 'price_low':
      return s.sort((a, b) => a.my_monthly_cost - b.my_monthly_cost)
  }
}

// ─── Minimal subscription row ─────────────────────────────────────────────────
interface SubscriptionRowProps {
  sub: SubscriptionWithCosts
  isSelected: boolean
  onOpen: (sub: SubscriptionWithCosts) => void
  viewMode: 'monthly' | 'yearly'
  numSkeleton: boolean
}

function SubscriptionRow({ sub, isSelected, onOpen, viewMode, numSkeleton }: SubscriptionRowProps) {
  const t = useT()
  return (
    <motion.div
      style={{ visibility: isSelected ? 'hidden' : undefined }}
      /* Scroll-triggered enter animation: each row fades in from a
         light blur + 0.90 scale as it enters the viewport from below,
         matching the premium iOS feel requested by the user. */
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.15, margin: '-80px 0px -60px 0px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        layoutId={`card-${sub.id}`}
        onClick={() => onOpen(sub)}
        className="flex items-center justify-between py-4 cursor-pointer active:opacity-60 transition-opacity"
        whileTap={{ opacity: 0.6 }}
      >
        {/* Name + optional status for non-active */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className="text-[16px] font-medium text-[#121212] dark:text-[#F2F2F7] truncate">
            {sub.name}
          </span>
          {sub.status !== 'active' && (
            <span
              className="text-[12px] font-medium flex-shrink-0"
              style={{ color: STATUS_COLOR[sub.status] ?? '#9CA3AF' }}
            >
              {t(`status.${sub.status}` as Parameters<typeof t>[0])}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex-shrink-0 ml-6">
          {numSkeleton ? (
            <div className="h-5 w-16 rounded bg-[#F0F0F0] dark:bg-[#3A3A3C] animate-pulse" />
          ) : (
            <span className="text-[16px] font-medium text-[#121212] dark:text-[#F2F2F7] tabular-nums">
              {viewMode === 'monthly'
                ? formatCurrency(sub.my_monthly_cost, sub.currency)
                : formatCurrency(sub.my_annual_cost, sub.currency)}
              <span className="text-[13px] font-normal text-[#737373] dark:text-[#8E8E93] ml-0.5">
                {viewMode === 'monthly' ? t('subscriptions.perMonth') : t('subscriptions.perYear')}
              </span>
            </span>
          )}
        </div>
      </motion.div>
      <div className="border-b border-[#E8E8E8] dark:border-[#2C2C2E]" />
    </motion.div>
  )
}

// ─── Filter bottom sheet ───────────────────────────────────────────────────────
interface FilterSheetProps {
  isOpen: boolean
  currentStatus: string
  currentCategory: string
  onClose: () => void
}

function FilterSheet({ isOpen, currentStatus, currentCategory, onClose }: FilterSheetProps) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>((currentStatus as SubscriptionStatus) ?? 'all')
  const [category, setCategory] = useState<Category | 'all'>((currentCategory as Category) ?? 'all')

  function apply() {
    const p = new URLSearchParams()
    if (status !== 'all') {
      p.set('status', status)
      AnalyticsEvents.filterApplied('status', status)
    }
    if (category !== 'all') {
      p.set('category', category)
      AnalyticsEvents.filterApplied('category', category)
    }
    router.push(`${pathname}${p.size ? '?' + p.toString() : ''}`, { scroll: false })
    onClose()
  }

  function reset() {
    router.push(pathname, { scroll: false })
    onClose()
  }

  const footer = (
    <div className="flex gap-3 px-5 py-4 border-t border-[#F0F0F0] dark:border-[#2C2C2E]">
      <button onClick={reset}
        className="flex-1 h-12 rounded-full text-sm font-semibold text-[#444444] dark:text-[#AEAEB2] bg-white dark:bg-[#2C2C2E] transition-colors active:bg-[#ECECEC] dark:active:bg-[#3A3A3C]">
        {t('subscriptions.reset')}
      </button>
      <button onClick={apply}
        className="flex-1 h-12 rounded-full text-sm font-semibold text-white bg-[#121212] hover:bg-[#333333] transition-colors active:bg-[#444444]">
        {t('subscriptions.apply')}
      </button>
    </div>
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('sheets.filter')} footer={footer}>
      <div className="px-5 pt-2 pb-5 space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-[#737373] dark:text-[#8E8E93] uppercase tracking-wider mb-3">{t('subscriptions.filterStatus')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {([
              { value: 'active' as const, label: t('status.active') },
              { value: 'trial' as const, label: t('status.trial') },
              { value: 'paused' as const, label: t('status.paused') },
              { value: 'cancelled' as const, label: t('status.cancelled') },
            ] as Array<{ value: SubscriptionStatus | 'all'; label: string }>).map(opt => (
              <button key={opt.value} onClick={() => setStatus(s => s === opt.value ? 'all' : opt.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 h-12 rounded-full text-sm font-medium border transition-colors duration-150 ${status === opt.value ? 'bg-[#121212] text-white border-[#121212]' : 'bg-white dark:bg-[#2A2A2C] text-[#444444] dark:text-[#AEAEB2] border-[#E8E8E8] dark:border-[#3A3A3C]'}`}>
                {status === opt.value && <Check size={12} strokeWidth={3} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#737373] dark:text-[#8E8E93] uppercase tracking-wider mb-3">{t('subscriptions.filterCategory')}</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const active = category === cat.value
              return (
                <button key={cat.value} onClick={() => setCategory(c => c === cat.value ? 'all' : cat.value)}
                  className={`flex items-center gap-2 px-3 h-12 rounded-full text-sm font-medium border transition-colors duration-150 ${active ? 'bg-[#121212] text-white border-[#121212]' : 'bg-white dark:bg-[#2A2A2C] text-[#444444] dark:text-[#AEAEB2] border-[#E8E8E8] dark:border-[#3A3A3C]'}`}>
                  <Icon size={13} strokeWidth={2} />
                  {t(`categories.${cat.value}` as Parameters<typeof t>[0])}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

// ─── Sort dropdown ─────────────────────────────────────────────────────────────
function SortDropdown({
  current,
  onSelect,
}: {
  current: SortMode
  onSelect: (mode: SortMode) => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const options: { mode: SortMode; label: string }[] = [
    { mode: 'alphabetical',     label: t('subscriptions.sortAlphabetical') },
    { mode: 'recently_added',   label: t('subscriptions.sortRecentlyAdded') },
    { mode: 'recently_updated', label: t('subscriptions.sortRecentlyUpdated') },
    { mode: 'price_high',       label: t('subscriptions.sortPriceHigh') },
    { mode: 'price_low',        label: t('subscriptions.sortPriceLow') },
  ]

  const currentLabel = options.find(o => o.mode === current)?.label ?? ''

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onScroll() { setOpen(false) }
    if (open) {
      document.addEventListener('mousedown', onMouseDown)
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 active:opacity-60 transition-opacity"
      >
        <span className="text-[13px] text-[#737373] dark:text-[#8E8E93]">{t('subscriptions.sortBy')}:</span>
        <span className="text-[13px] text-[#444444] dark:text-[#AEAEB2]">{currentLabel}</span>
        <ChevronsUpDown size={11} className="text-[#BBBBBB] dark:text-[#8E8E93] ml-0.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E8E8E8] dark:border-[#2C2C2E] z-50 animate-fade-in-scale">
          <div className="p-2">
            {options.map(({ mode, label }) => {
              const active = current === mode
              return (
                <button
                  key={mode}
                  onClick={() => { onSelect(mode); setOpen(false) }}
                  className={`w-full flex items-center justify-between gap-4 px-3 py-2 text-sm transition-colors text-left rounded-[8px] ${active ? 'text-[#121212] bg-[#F0F0F0] dark:bg-[#2C2C2E]' : 'text-[#424242] dark:text-[#AEAEB2] hover:bg-white dark:hover:bg-[#2C2C2E]'}`}
                >
                  {label}
                  {active && <Check size={13} strokeWidth={2.5} className="text-[#121212] dark:text-[#F2F2F7] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────
interface SubscriptionsViewProps {
  subscriptions: SubscriptionWithCosts[]
  allCount: number
  stats: DashboardStats
  currentStatus: string
  currentCategory: string
  newSubscriptionId?: string
}

export default function SubscriptionsView({
  subscriptions,
  allCount,
  stats,
  currentStatus,
  currentCategory,
  newSubscriptionId,
}: SubscriptionsViewProps) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Listen for floating calendar button (lives outside SubscriptionsView)
  useEffect(() => {
    function onOpenCal() { setCalendarOpen(true) }
    window.addEventListener('oso:open-calendar', onOpenCal)
    return () => window.removeEventListener('oso:open-calendar', onOpenCal)
  }, [])
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical')
  const filterShake = useAnimationControls()

  const [removingChip, setRemovingChip] = useState<'status' | 'category' | null>(null)

  function clearFilter(key: 'status' | 'category') {
    setRemovingChip(key)
    haptics.tap()
    setTimeout(() => {
      const p = new URLSearchParams()
      if (key !== 'status' && currentStatus && currentStatus !== 'all') p.set('status', currentStatus)
      if (key !== 'category' && currentCategory && currentCategory !== 'all') p.set('category', currentCategory)
      router.push(`${pathname}${p.size ? '?' + p.toString() : ''}`, { scroll: false })
      setRemovingChip(null)
    }, 260)
  }

  function handleFilterTap() {
    if (allCount === 0) {
      haptics.error()
      filterShake.start({
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      })
      return
    }
    setFilterOpen(true)
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('perezoso:subs-count', { detail: allCount }),
    )
  }, [allCount])

  const scrollY = useEffectiveScrollY()
  // Header stays untouched until the user has actually scrolled past
  // ~60 px, then the opacity + blur ramp gradually over the next ~140 px.
  const headerOpacity       = useTransform(scrollY, [60, 200], [1, 0])
  const headerBlurPx        = useTransform(scrollY, [60, 200], [0, 8])
  const headerFilter        = useMotionTemplate`blur(${headerBlurPx}px)`
  const headerPointerEvents = useTransform(headerOpacity, (v) => v < 0.05 ? 'none' : 'auto')

  const [selectedSub, setSelectedSub] = useState<SubscriptionWithCosts | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [closingSubId, setClosingSubId] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')
  const [numSkeleton, setNumSkeleton] = useState(false)
  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function toggleViewMode() {
    if (numSkeleton) return
    setNumSkeleton(true)
    skeletonTimer.current = setTimeout(() => {
      setViewMode(prev => prev === 'monthly' ? 'yearly' : 'monthly')
      setNumSkeleton(false)
    }, 1200)
  }

  useEffect(() => {
    return () => { if (skeletonTimer.current) clearTimeout(skeletonTimer.current) }
  }, [])

  function openSub(sub: SubscriptionWithCosts) {
    setClosingSubId(null)
    setSelectedSub(sub)
    setOverlayVisible(true)
  }

  function closeSub() {
    setClosingSubId(selectedSub?.id ?? null)
    setOverlayVisible(false)
  }

  const hasActiveFilters = (currentStatus && currentStatus !== 'all') || (currentCategory && currentCategory !== 'all')
  const sortedSubscriptions = sortSubscriptions(subscriptions, sortMode)

  return (
    <LayoutGroup>
      {/* ── Header ────────────────────────────────────────────────────────
         Scrolls naturally with the page (no longer sticky / fixed) and
         sits at z-40 — above the global .top-fade-mask (z-30) — so the
         backdrop blur of the mask never affects it. The opacity / blur
         transition is driven only by scrollY, kicking in at ~60 px. */}
      <motion.div
        className="relative z-[40] pb-4 bg-white dark:bg-[#121212]"
        style={{ opacity: headerOpacity, filter: headerFilter, pointerEvents: headerPointerEvents }}
      >
        <div className="flex items-start justify-between pt-2">
          <div>
            <h1 className="text-[28px] font-bold text-[#121212] dark:text-[#F2F2F7] tracking-tight">
              {t('subscriptions.title')}
            </h1>
            {allCount > 0 && (
              <p className="text-[18px] font-bold text-[#121212] dark:text-[#F2F2F7] mt-1 leading-snug">
                Pagas{' '}
                <button
                  onClick={toggleViewMode}
                  className="inline align-baseline cursor-pointer select-none active:scale-95 transition-transform"
                >
                  {numSkeleton ? (
                    <span
                      className="inline-block align-middle rounded-md bg-[#E0E0E0] dark:bg-[#3A3A3C] animate-pulse"
                      style={{ width: '7ch', height: '1em', verticalAlign: 'baseline' }}
                    />
                  ) : (
                    <span className="underline underline-offset-2">
                      {viewMode === 'monthly'
                        ? formatCurrency(stats.total_monthly_cost, 'EUR')
                        : formatCurrency(stats.total_annual_cost, 'EUR')}
                    </span>
                  )}
                </button>
                {' '}{viewMode === 'monthly' ? '/mes' : '/año'} en{' '}
                {allCount === 1 ? '1 suscripción activa' : `${allCount} suscripciones activas`}.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <motion.button
              onClick={handleFilterTap}
              animate={filterShake}
              className="relative w-10 h-10 rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] flex items-center justify-center transition-colors active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E]"
            >
              <SlidersHorizontal size={17} strokeWidth={2} className="text-[#333333] dark:text-[#F2F2F7]" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#121212] dark:bg-[#F2F2F7] border-2 border-white dark:border-[#121212]" />
              )}
            </motion.button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('oso:reveal-analytics'))}
              className="w-10 h-10 rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] flex items-center justify-center transition-colors active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E]"
              aria-label="Analytics"
            >
              <BarChart3 size={17} strokeWidth={2} className="text-[#333333] dark:text-[#F2F2F7]" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sort control */}
      {allCount > 0 && (
        <div className="relative z-[30] mt-2 mb-2">
          <SortDropdown current={sortMode} onSelect={(mode) => { setSortMode(mode); AnalyticsEvents.sortChanged(mode) }} />
        </div>
      )}

      {/* ── List ──────────────────────────────────────────────────────────── */}
      <div className="relative z-[1]">
        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <AnimatePresence>
              {currentStatus && currentStatus !== 'all' && removingChip !== 'status' && (
                <motion.button
                  key="chip-status"
                  type="button"
                  onClick={() => clearFilter('status')}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4, filter: 'blur(4px)', y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-[#F0F0F0] dark:bg-[#2C2C2E] text-[#121212] dark:text-[#F2F2F7] text-[13px] font-medium active:opacity-70 transition-opacity"
                >
                  {t(`status.${currentStatus}` as Parameters<typeof t>[0])}
                  <X size={14} strokeWidth={2.5} className="text-[#737373] dark:text-[#AEAEB2]" />
                </motion.button>
              )}
              {currentCategory && currentCategory !== 'all' && removingChip !== 'category' && (
                <motion.button
                  key="chip-category"
                  type="button"
                  onClick={() => clearFilter('category')}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4, filter: 'blur(4px)', y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-[#F0F0F0] dark:bg-[#2C2C2E] text-[#121212] dark:text-[#F2F2F7] text-[13px] font-medium active:opacity-70 transition-opacity"
                >
                  {t(`categories.${currentCategory}` as Parameters<typeof t>[0])}
                  <X size={14} strokeWidth={2.5} className="text-[#737373] dark:text-[#AEAEB2]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Top separator */}
        {sortedSubscriptions.length > 0 && (
          <div className="border-t border-[#E8E8E8] dark:border-[#2C2C2E]" />
        )}

        {sortedSubscriptions.length === 0 ? (
          allCount === 0 ? (
            <div className="pt-6">
              <p className="text-[17px] font-bold text-[#121212] dark:text-[#F2F2F7] leading-snug mb-6">
                {t('subscriptions.getStarted')}
              </p>
              <QuickAddPlatforms />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm font-medium text-[#121212] dark:text-[#F2F2F7] mb-1">
                {t('subscriptions.noResults')}
              </p>
              <p className="text-xs text-[#737373] dark:text-[#8E8E93]">
                {t('subscriptions.noResultsHint')}
              </p>
              <button
                type="button"
                onClick={() => router.push(pathname, { scroll: false })}
                className="mt-3 text-[13px] font-semibold text-[#121212] dark:text-[#F2F2F7] underline underline-offset-2 active:opacity-60 transition-opacity"
              >
                {t('subscriptions.clearFilters')}
              </button>
            </div>
          )
        ) : (
          sortedSubscriptions.map(sub => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              isSelected={sub.id === (selectedSub?.id ?? null) && !!closingSubId === false}
              onOpen={openSub}
              viewMode={viewMode}
              numSkeleton={numSkeleton}
            />
          ))
        )}
      </div>

      {/* ── Card expansion overlay ─────────────────────────────────────────── */}
      <AnimatePresence onExitComplete={() => { setSelectedSub(null); setClosingSubId(null) }}>
        {overlayVisible && selectedSub && (
          <SubscriptionDetailOverlay
            sub={selectedSub}
            onClose={closeSub}
            isClosing={closingSubId === selectedSub.id}
          />
        )}
      </AnimatePresence>

      {/* ── Filter bottom sheet ───────────────────────────────────────────── */}
      <FilterSheet
        isOpen={filterOpen}
        currentStatus={currentStatus}
        currentCategory={currentCategory}
        onClose={() => setFilterOpen(false)}
      />

      {/* ── Calendar bottom sheet ─────────────────────────────────────────── */}
      <BottomSheet isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} height="full">
        <div className="px-5 pt-3 pb-5">
          <CalendarView subscriptions={subscriptions} />
        </div>
      </BottomSheet>
    </LayoutGroup>
  )
}
