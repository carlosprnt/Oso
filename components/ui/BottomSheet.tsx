'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useDragControls,
  animate,
  type PanInfo,
} from 'framer-motion'

/*
 * BottomSheet
 * ---------------------------------------------------------------
 * Native-iOS-style bottom sheet. Slides up from the bottom over a
 * dimmed backdrop, spring-based motion, continuous top corner
 * radius, centred grabber pill, safe-area bleed, and dismiss
 * gestures that behave like a real iOS sheet:
 *
 *   - Dragging the grabber down moves the sheet with the finger;
 *     release past the threshold or a quick flick closes it.
 *   - When the scroll container inside the sheet is at its top and
 *     the user keeps pulling down, the gesture is transferred to
 *     the sheet itself: the sheet starts following the finger in
 *     place of the native scroll.
 *   - Release decides between dismiss (offset past 120 px OR
 *     downward velocity > 500 px/s) and spring back to the open
 *     position.
 *   - Safe-area bleed so the sheet's surface extends behind the
 *     iOS home indicator overlay.
 */

const OPEN_SPRING    = { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.95 }
const CLOSE_SPRING   = { type: 'spring' as const, stiffness: 420, damping: 42, mass: 0.85 }
const SNAP_BACK      = { type: 'spring' as const, stiffness: 460, damping: 36, mass: 0.9 }
const BACKDROP_FADE  = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }

const DISMISS_OFFSET_PX   = 120
const DISMISS_VELOCITY_PX = 500
const DRAG_START_THRESHOLD = 6 // px of finger travel before we steal the gesture from scroll

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  height?: 'auto' | 'tall' | 'full'
  zIndex?: number
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  height = 'tall',
  zIndex,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const scrollRef    = useRef<HTMLDivElement>(null)
  const onCloseRef   = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Drag/position motion state
  const y = useMotionValue(0)
  const dragControls = useDragControls()

  // ── Body scroll lock ─────────────────────────────────────────
  const savedScrollY = useRef(0)
  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top      = `-${savedScrollY.current}px`
      document.body.style.left     = '0'
      document.body.style.right    = '0'
    } else {
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.left     = ''
      document.body.style.right    = ''
      window.scrollTo(0, savedScrollY.current)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.left     = ''
      document.body.style.right    = ''
    }
  }, [isOpen])

  // ── Reset scroll + y on open ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      y.set(0)
    }
  }, [isOpen, y])

  // ── Scroll-at-top pull-down-to-dismiss ──────────────────────
  // Native listeners so we can .preventDefault() the scroll gesture
  // and transfer it to the sheet when the user keeps pulling down
  // with scrollTop already at 0.
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!isOpen || !scrollEl) return

    let touchStartY   = 0
    let touchStartTop = 0
    let lastY         = 0
    let lastT         = 0
    let dragging      = false

    function onStart(e: TouchEvent) {
      touchStartY   = e.touches[0].clientY
      touchStartTop = scrollEl!.scrollTop
      lastY         = touchStartY
      lastT         = e.timeStamp
      dragging      = false
    }

    function onMove(e: TouchEvent) {
      const cy = e.touches[0].clientY
      const dy = cy - touchStartY

      // Only steal the gesture if the scroll was at the top when
      // the finger landed AND the user is pulling down.
      if (!dragging && touchStartTop === 0 && dy > DRAG_START_THRESHOLD) {
        dragging = true
        y.stop() // cancel any running open-spring so drag takes over
      }

      if (dragging) {
        e.preventDefault()
        y.set(Math.max(0, dy - DRAG_START_THRESHOLD))
        lastY = cy
        lastT = e.timeStamp
      }
    }

    function onEnd(e: TouchEvent) {
      if (!dragging) return
      dragging = false
      const cy = e.changedTouches[0].clientY
      const dy = cy - touchStartY
      const elapsed = Math.max(1, e.timeStamp - lastT) / 1000
      const velocity = (cy - lastY) / elapsed
      const offset = Math.max(0, dy - DRAG_START_THRESHOLD)

      if (offset > DISMISS_OFFSET_PX || velocity > DISMISS_VELOCITY_PX) {
        // Let AnimatePresence's exit run — just flip the prop.
        onCloseRef.current()
      } else {
        animate(y, 0, SNAP_BACK)
      }
    }

    scrollEl.addEventListener('touchstart',  onStart, { passive: true  })
    scrollEl.addEventListener('touchmove',   onMove,  { passive: false })
    scrollEl.addEventListener('touchend',    onEnd,   { passive: true  })
    scrollEl.addEventListener('touchcancel', onEnd,   { passive: true  })
    return () => {
      scrollEl.removeEventListener('touchstart',  onStart)
      scrollEl.removeEventListener('touchmove',   onMove)
      scrollEl.removeEventListener('touchend',    onEnd)
      scrollEl.removeEventListener('touchcancel', onEnd)
    }
  }, [isOpen, y])

  // ── Grabber drag release handler ────────────────────────────
  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y > DISMISS_OFFSET_PX || info.velocity.y > DISMISS_VELOCITY_PX) {
      onCloseRef.current()
    } else {
      animate(y, 0, SNAP_BACK)
    }
  }

  if (!mounted) return null

  const maxH = {
    auto: 'max-h-[80dvh]',
    tall: 'max-h-[82dvh]',
    full: 'max-h-[92dvh]',
  }[height]

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 dark:bg-black/70"
            style={{ zIndex: zIndex ? zIndex - 2 : 58 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={BACKDROP_FADE}
            onClick={() => onCloseRef.current()}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className={`fixed left-0 right-0 bg-white dark:bg-[#1C1C1E] flex flex-col ${maxH}`}
            style={{
              zIndex: zIndex ?? 60,
              y,
              bottom: 'calc(env(safe-area-inset-bottom) * -1)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              borderRadius: '16px 16px 0 0',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={OPEN_SPRING}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.15 }}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber — tapping it starts a framer-motion drag */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex-shrink-0 flex justify-center pt-2.5 pb-1.5 touch-none select-none cursor-grab active:cursor-grabbing"
            >
              <div className="w-9 h-[5px] rounded-full bg-[#D4D4D4] dark:bg-[#48484A]" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3">
                <h2 className="text-[17px] font-semibold text-[#121212] dark:text-[#F2F2F7]">
                  {title}
                </h2>
                <button
                  onClick={() => onCloseRef.current()}
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#2C2C2E] flex items-center justify-center text-[#616161] dark:text-[#AEAEB2] transition-colors active:bg-[#EBEBEB] dark:active:bg-[#3A3A3C]"
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-hidden min-h-0"
              style={{
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
            >
              {children}
            </div>

            {/* Optional fixed footer */}
            {footer && (
              <div className="flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(sheet, document.body)
}
