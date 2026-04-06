/**
 * Cross-platform haptic feedback.
 *
 * Resolution order (async, lazy):
 *   1. Capacitor `@capacitor/haptics` plugin — real Taptic Engine on iOS
 *      and native vibration on Android. Only available after the app is
 *      wrapped with Capacitor.
 *   2. `navigator.vibrate()` — works on Chrome Android / Firefox Android,
 *      ignored on iOS Safari.
 *   3. Silent no-op.
 *
 * The wrapper never throws — callers can invoke it unconditionally from
 * any event handler without worrying about feature detection.
 */

type Impact = 'light' | 'medium' | 'heavy'

let capacitorHaptics: {
  impact?: (opts: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void>
  notification?: (opts: { type: 'SUCCESS' | 'WARNING' | 'ERROR' }) => Promise<void>
  selectionStart?: () => Promise<void>
  selectionChanged?: () => Promise<void>
  selectionEnd?: () => Promise<void>
} | null | undefined

async function loadCapacitor() {
  if (capacitorHaptics !== undefined) return capacitorHaptics
  if (typeof window === 'undefined') { capacitorHaptics = null; return null }
  try {
    // Dynamic import so web bundles don't pull Capacitor in. Resolves to
    // `null` if the package is not installed — which is exactly what we
    // want in the current web-only deploy.
    const mod = await import(/* webpackIgnore: true */ '@capacitor/haptics' as string).catch(() => null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    capacitorHaptics = (mod as any)?.Haptics ?? null
  } catch {
    capacitorHaptics = null
  }
  return capacitorHaptics
}

function webVibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  try { navigator.vibrate(pattern) } catch { /* ignore */ }
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Light tap — use on regular button presses where you want subtle feedback. */
export function tap(impact: Impact = 'light') {
  loadCapacitor().then((h) => {
    if (h?.impact) {
      h.impact({ style: impact.toUpperCase() as 'LIGHT' | 'MEDIUM' | 'HEAVY' }).catch(() => {})
      return
    }
    webVibrate(impact === 'heavy' ? 20 : impact === 'medium' ? 12 : 8)
  })
}

/** Selection changed — use on toggles, pickers, slide swipes, segmented controls. */
export function selection() {
  loadCapacitor().then((h) => {
    if (h?.selectionChanged) {
      h.selectionChanged().catch(() => {})
      return
    }
    webVibrate(6)
  })
}

/** Success notification — use after creating/saving something. */
export function success() {
  loadCapacitor().then((h) => {
    if (h?.notification) {
      h.notification({ type: 'SUCCESS' }).catch(() => {})
      return
    }
    webVibrate([10, 40, 10])
  })
}

/** Warning notification — use before destructive confirmations. */
export function warning() {
  loadCapacitor().then((h) => {
    if (h?.notification) {
      h.notification({ type: 'WARNING' }).catch(() => {})
      return
    }
    webVibrate([15, 30, 15])
  })
}

/** Error notification — use on failed saves, validation errors, shakes. */
export function error() {
  loadCapacitor().then((h) => {
    if (h?.notification) {
      h.notification({ type: 'ERROR' }).catch(() => {})
      return
    }
    webVibrate([20, 50, 20, 50, 20])
  })
}

export const haptics = { tap, selection, success, warning, error }
export default haptics
