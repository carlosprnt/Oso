'use client'

import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion'

/*
 * DragToRevealSurface
 * ──────────────────────────────────────────────────────────────
 * Two-layer home screen. A fixed dark analytics layer sits behind
 * a draggable white foreground. Pulling the foreground down from
 * ANYWHERE reveals the dark layer; releasing snaps to one of two
 * positions:
 *
 *   raised  → y = 0   (foreground covers everything)
 *   lowered → y = H − 64 px  (only 64 px of foreground visible)
 *
 * Gesture priority:
 *  • If the inner scroll is NOT at the top → scroll normally.
 *  • If the inner scroll IS at the top AND the user pulls down
 *    → transfer the gesture to the foreground surface drag.
 *  • If the surface is already lowered → any upward touch raises it.
 *
 * The drag drives a CSS variable --surface-y on <html> so the
 * FloatingNav (which lives in the dashboard layout) can translate
 * with the surface without being a DOM child of it.
 */

const PEEK_HEIGHT   = 120     // px of foreground visible when lowered
const SNAP_THRESHOLD = 0.12   // fraction of LOWERED_Y — above this snaps lowered, below snaps raised
const VEL_THRESHOLD  = 400    // px/s flick threshold

const SNAP_SPRING = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 36,
  mass: 0.95,
  restDelta: 0.5,
}

interface Props {
  analytics: ReactNode
  children: ReactNode
}

export default function DragToRevealSurface({ analytics, children }: Props) {
  const y = useMotionValue(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [loweredY, setLoweredY] = useState(0)
  const [isRaised, setIsRaised] = useState(true)
  const raisedRef = useRef(true)  // perf: avoids re-render on every touch

  // Listen for programmatic reveal (stats button in SubscriptionsView header)
  useEffect(() => {
    function onReveal() {
      if (raisedRef.current && loweredY > 0) {
        raisedRef.current = false
        setIsRaised(false)
        animate(y, loweredY, SNAP_SPRING)
      }
    }
    window.addEventListener('oso:reveal-analytics', onReveal)
    return () => window.removeEventListener('oso:reveal-analytics', onReveal)
  }, [y, loweredY])

  // Compute LOWERED_Y from actual viewport height
  useEffect(() => {
    function measure() {
      setLoweredY(window.innerHeight - PEEK_HEIGHT)
    }
    measure()
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
    }
  }, [])

  // Sync to CSS variable so FloatingNav can follow + control the
  // top fade mask visibility based on BOTH drag state and scroll.
  // Mask is hidden by default (no blur at rest), shown only when
  // the user scrolls inside the white surface, and hidden again
  // when the surface is dragged down to reveal the dark layer.
  const scrolledRef = useRef(false)

  useEffect(() => {
    return y.on('change', (v) => {
      document.documentElement.style.setProperty('--surface-y', `${v}px`)
      const mask = document.querySelector('.top-fade-mask') as HTMLElement | null
      if (mask) {
        mask.style.opacity = (v > 30 || !scrolledRef.current) ? '0' : '1'
      }
    })
  }, [y])

  // Listen to scroll inside the white surface to show/hide the mask
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const scrolled = el!.scrollTop > 10
      if (scrolled !== scrolledRef.current) {
        scrolledRef.current = scrolled
        const mask = document.querySelector('.top-fade-mask') as HTMLElement | null
        if (mask) {
          mask.style.opacity = (scrolled && y.get() < 30) ? '1' : '0'
        }
      }
    }
    // Start hidden
    const mask = document.querySelector('.top-fade-mask') as HTMLElement | null
    if (mask) mask.style.opacity = '0'

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [y])

  // Reset CSS variable on unmount
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--surface-y')
    }
  }, [])

  // ── Touch gesture handler ─────────────────────────────────
  // Covers the ENTIRE foreground surface (not just the header).
  // Uses native touch events so we can preventDefault the scroll
  // and seamlessly transfer to the surface drag.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || loweredY === 0) return

    let startY       = 0
    let startTop     = 0
    let lastY        = 0
    let lastT        = 0
    let dragging     = false
    let locked       = false  // once we decide scroll vs drag, lock it

    function onStart(e: TouchEvent) {
      startY   = e.touches[0].clientY
      startTop = el!.scrollTop
      lastY    = startY
      lastT    = e.timeStamp
      dragging = false
      locked   = false
    }

    function onMove(e: TouchEvent) {
      if (locked && !dragging) return  // committed to scroll, bail

      const cy = e.touches[0].clientY
      const dy = cy - startY

      // CASE 1: surface is lowered → ANY gesture becomes a drag
      // (no scroll allowed in the lowered state — the surface
      // must follow the finger so the user can pull it back up)
      if (!raisedRef.current && !dragging && Math.abs(dy) > 6) {
        dragging = true
        locked   = true
        y.stop()
      }

      // CASE 2: surface is raised, scroll at top, pulling down
      if (raisedRef.current && !dragging && startTop === 0 && el!.scrollTop === 0 && dy > 6) {
        dragging = true
        locked   = true
        y.stop()
      }

      // CASE 3: scrolling normally (only when raised)
      if (!dragging && Math.abs(dy) > 6) {
        locked = true
        return
      }

      if (dragging) {
        e.preventDefault()
        const currentBase = raisedRef.current ? 0 : loweredY
        const raw = currentBase + dy
        // Clamp between 0 and loweredY with slight rubber-band past edges
        const clamped = raw < 0
          ? raw * 0.15                         // rubber-band above
          : raw > loweredY
          ? loweredY + (raw - loweredY) * 0.15 // rubber-band below
          : raw
        y.set(clamped)
        lastY = cy
        lastT = e.timeStamp
      }
    }

    function onEnd(e: TouchEvent) {
      if (!dragging) return
      const wasRaised = raisedRef.current
      dragging = false
      locked   = false

      const cy = e.changedTouches[0].clientY
      const elapsed = Math.max(1, e.timeStamp - lastT) / 1000
      const vel = (cy - lastY) / elapsed
      const cur = y.get()

      let target: number

      if (!wasRaised) {
        // Surface was lowered → ANY upward movement snaps raised
        target = cur < loweredY ? 0 : loweredY
      } else if (Math.abs(vel) > VEL_THRESHOLD) {
        target = vel > 0 ? loweredY : 0
      } else {
        target = cur > loweredY * SNAP_THRESHOLD ? loweredY : 0
      }

      raisedRef.current = target === 0
      setIsRaised(target === 0)
      animate(y, target, SNAP_SPRING)
    }

    el.addEventListener('touchstart',  onStart, { passive: true })
    el.addEventListener('touchmove',   onMove,  { passive: false })
    el.addEventListener('touchend',    onEnd,   { passive: true })
    el.addEventListener('touchcancel', onEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart',  onStart)
      el.removeEventListener('touchmove',   onMove)
      el.removeEventListener('touchend',    onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [y, loweredY])

  // ── Dark layer transforms (subtle parallax + fade-in) ────
  const darkOpacity   = useTransform(y, [0, loweredY || 1], [0, 1])
  const darkTranslate = useTransform(y, [0, loweredY || 1], [-30, 0])

  return (
    <>
      {/* ── Dark analytics layer (fixed, behind everything) ──── */}
      <div
        className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden"
        aria-hidden={isRaised}
      >
        <motion.div
          style={{ opacity: darkOpacity, y: darkTranslate }}
          className="h-full"
        >
          {analytics}
        </motion.div>
      </div>

      {/* ── White foreground surface (draggable) ──────────────── */}
      <motion.div
        style={{ y }}
        className="fixed inset-0 z-10 flex flex-col bg-white dark:bg-[#121212] rounded-t-[32px] overflow-hidden will-change-transform"
      >
        {/* Scrollable interior — the touch listeners live here
            so they can read scrollTop and decide scroll vs drag */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'none',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </div>

      </motion.div>
    </>
  )
}
