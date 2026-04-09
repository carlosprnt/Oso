'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useDragControls,
  useTransform,
  animate,
  type PanInfo,
} from 'framer-motion'

/*
 * DraggableSubscriptionsLayer — a two-layer home screen.
 *
 * Background: a fixed, full-screen, near-black analytics layer with
 * editorial insights + KPI cards. It is mostly hidden in the default
 * state and revealed from the top when the user drags the foreground
 * down.
 *
 * Foreground: a draggable white surface with the subscriptions list,
 * sticky header and floating CTAs. Drag is started from the top drag
 * handle only so the list scroll inside it keeps working normally.
 *
 * Snap behaviour: two fixed positions — y = 0 (raised, default) and
 * y = LOWERED_Y (lowered, analytics peek). Spring snap with refined
 * damping; no bounce.
 */

const LOWERED_Y = 360  // how far the white surface slides down when lowered
const SNAP_THRESHOLD = LOWERED_Y / 2
const VELOCITY_THRESHOLD = 280 // px/s — minimum flick velocity to force a direction

interface Props {
  children: ReactNode
}

export default function DraggableSubscriptionsLayer({ children }: Props) {
  const y = useMotionValue(0)
  const dragControls = useDragControls()
  const raisedRef = useRef(true)

  /**
   * Dark layer content fades + subtly parallaxes up as the surface is pulled
   * down. Nothing wild — just enough to feel layered.
   */
  const darkOpacity = useTransform(y, [0, LOWERED_Y], [0, 1])
  const darkTranslate = useTransform(y, [0, LOWERED_Y], [-24, 0])

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const cur = y.get()
    const v = info.velocity.y

    let target: number
    if (v > VELOCITY_THRESHOLD) {
      target = LOWERED_Y
    } else if (v < -VELOCITY_THRESHOLD) {
      target = 0
    } else {
      target = cur > SNAP_THRESHOLD ? LOWERED_Y : 0
    }

    raisedRef.current = target === 0
    animate(y, target, {
      type: 'spring',
      stiffness: 360,
      damping: 36,
      mass: 0.95,
      restDelta: 0.3,
    })
  }

  return (
    <>
      {/* ── Analytics layer — fixed, behind everything ───────────── */}
      <div
        className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          style={{ opacity: darkOpacity, y: darkTranslate }}
          className="px-6"
        >
          <div
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 28px)' }}
            className="max-w-xl mx-auto"
          >
            {/* Editorial headline */}
            <p className="text-[#8E8E93] text-[11px] font-semibold uppercase tracking-[0.22em] mb-2">
              Tendencia del mes
            </p>
            <p className="text-white text-[26px] font-extrabold tracking-tight leading-[1.12]">
              Gastas más en productividad
              <br />
              que en entretenimiento.
            </p>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[#8E8E93] text-[10px] font-semibold uppercase tracking-wider">
                  Próximas 7 días
                </p>
                <p className="text-white text-[22px] font-bold tabular-nums mt-1.5">
                  2
                </p>
                <p className="text-[#8E8E93] text-[11px] mt-0.5">
                  renovaciones
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[#8E8E93] text-[10px] font-semibold uppercase tracking-wider">
                  Gasto IA
                </p>
                <p className="text-white text-[22px] font-bold tabular-nums mt-1.5">
                  35,98€
                </p>
                <p className="text-[#8E8E93] text-[11px] mt-0.5">
                  /mes en ChatGPT + Claude
                </p>
              </div>
            </div>

            {/* Editorial insight line */}
            <p className="text-white/80 text-[14px] leading-snug mt-5">
              Claude Pro y ChatGPT Plus concentran tu mayor gasto en IA este mes.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Draggable white surface ──────────────────────────────── */}
      <motion.div
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: LOWERED_Y }}
        dragElastic={0.04}
        style={{ y }}
        onDragEnd={handleDragEnd}
        className="fixed inset-0 z-10 flex flex-col bg-white dark:bg-[#121212] rounded-t-[32px] overflow-hidden"
      >
        {/* Top drag handle — the only area that starts the surface drag.
            Everything below this scrolls normally. */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex-shrink-0 touch-none select-none"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-[#D4D4D4] dark:bg-[#3A3A3C] rounded-full" />
          </div>
        </div>

        {/* Scrollable content — the list lives here and scrolls freely
            without interfering with the drag-to-reveal gesture. */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 sm:px-6 pb-28">
          {children}
        </div>
      </motion.div>
    </>
  )
}
