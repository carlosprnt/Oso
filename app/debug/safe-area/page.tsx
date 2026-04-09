'use client'

import { useEffect, useState } from 'react'

interface Measurements {
  standalone: boolean
  innerHeight: number
  clientHeight: number
  visualViewportHeight: number
  dvhProbe: number
  bodyBottom: number
  bodyHeight: number
  safeAreaTop: number
  safeAreaBottom: number
  dpr: number
  ua: string
}

function readMeasurements(): Measurements {
  // 100dvh probe
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100dvh;pointer-events:none;visibility:hidden;'
  document.body.appendChild(probe)
  const dvhProbe = probe.getBoundingClientRect().height
  probe.remove()

  // env(safe-area-inset-*) probes
  const topProbe = document.createElement('div')
  topProbe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top);pointer-events:none;visibility:hidden;'
  document.body.appendChild(topProbe)
  const safeAreaTop = topProbe.getBoundingClientRect().height
  topProbe.remove()

  const bottomProbe = document.createElement('div')
  bottomProbe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-bottom);pointer-events:none;visibility:hidden;'
  document.body.appendChild(bottomProbe)
  const safeAreaBottom = bottomProbe.getBoundingClientRect().height
  bottomProbe.remove()

  const bodyRect = document.body.getBoundingClientRect()

  return {
    standalone:
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari legacy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window.navigator as any).standalone === true),
    innerHeight: window.innerHeight,
    clientHeight: document.documentElement.clientHeight,
    visualViewportHeight: window.visualViewport?.height ?? -1,
    dvhProbe,
    bodyBottom: bodyRect.bottom,
    bodyHeight: bodyRect.height,
    safeAreaTop,
    safeAreaBottom,
    dpr: window.devicePixelRatio,
    ua: navigator.userAgent,
  }
}

export default function SafeAreaDebug() {
  const [m, setM] = useState<Measurements | null>(null)

  useEffect(() => {
    setM(readMeasurements())
    const onResize = () => setM(readMeasurements())
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', color: '#111', fontFamily: '-apple-system, system-ui, sans-serif', padding: '16px' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Safe-area debug</h1>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 16, lineHeight: 1.4 }}>
        Three fixed-position bars sit at the very bottom of the screen. Look at where each one visually ends (relative to the home indicator pill) and tell me which bar(s) reach the physical bottom edge of the device.
      </p>

      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 12, fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.6 }}>
        {m ? (
          <>
            <div><b>standalone</b>: {String(m.standalone)}</div>
            <div><b>innerHeight</b>: {m.innerHeight}</div>
            <div><b>doc.documentElement.clientHeight</b>: {m.clientHeight}</div>
            <div><b>visualViewport.height</b>: {m.visualViewportHeight}</div>
            <div><b>100dvh probe</b>: {m.dvhProbe}</div>
            <div><b>body.getBoundingClientRect().bottom</b>: {m.bodyBottom}</div>
            <div><b>body.getBoundingClientRect().height</b>: {m.bodyHeight}</div>
            <div><b>env(safe-area-inset-top)</b>: {m.safeAreaTop}</div>
            <div><b>env(safe-area-inset-bottom)</b>: {m.safeAreaBottom}</div>
            <div><b>devicePixelRatio</b>: {m.dpr}</div>
            <div style={{ marginTop: 6, wordBreak: 'break-all' }}><b>ua</b>: {m.ua}</div>
          </>
        ) : (
          'measuring…'
        )}
      </div>

      {/* Filler content so the page is scrollable, useful for verifying that
          fixed elements stay at the bottom even with scroll */}
      <div style={{ height: '120vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>
        scroll filler
      </div>

      {/*
        ── Three test bars ─────────────────────────────────────────────────
        All three sit at the bottom of the viewport, side-by-side
        (left / center / right). Each uses a DIFFERENT positioning
        strategy. Look at where each visually ends.

        A — RED   — standard pattern
            bottom: 0
            padding-bottom: env(safe-area-inset-bottom)
            inner content stops above safe-area; bg fills down to bottom: 0

        B — BLUE  — negative bleed pattern
            bottom: calc(env(safe-area-inset-bottom) * -1)
            padding-bottom: env(safe-area-inset-bottom)
            outer wrapper bleeds 34 px past the layout viewport; content
            still stops at the layout-viewport bottom

        C — GREEN — raw bottom: 0, no padding at all
            bottom: 0
            no padding
            tells us where bottom: 0 actually anchors in this webview
      ─────────────────────────────────────────────────────────────────── */}

      {/* A — RED — standard pattern */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          width: 80,
          bottom: 0,
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: '#e53935',
          color: 'white',
          fontWeight: 700,
          fontSize: 18,
          textAlign: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}
      >
        <div style={{ padding: '12px 0 8px' }}>A</div>
        <div style={{ fontSize: 9, fontWeight: 500, lineHeight: 1.2, padding: '0 4px 8px' }}>
          bottom:0
          <br />
          pad:safe
        </div>
      </div>

      {/* B — BLUE — negative bleed */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          marginLeft: -40,
          width: 80,
          bottom: 'calc(env(safe-area-inset-bottom) * -1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: '#1e88e5',
          color: 'white',
          fontWeight: 700,
          fontSize: 18,
          textAlign: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}
      >
        <div style={{ padding: '12px 0 8px' }}>B</div>
        <div style={{ fontSize: 9, fontWeight: 500, lineHeight: 1.2, padding: '0 4px 8px' }}>
          bottom:-safe
          <br />
          pad:safe
        </div>
      </div>

      {/* C — GREEN — raw bottom: 0 */}
      <div
        style={{
          position: 'fixed',
          right: 16,
          width: 80,
          bottom: 0,
          background: '#43a047',
          color: 'white',
          fontWeight: 700,
          fontSize: 18,
          textAlign: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}
      >
        <div style={{ padding: '12px 0 8px' }}>C</div>
        <div style={{ fontSize: 9, fontWeight: 500, lineHeight: 1.2, padding: '0 4px 8px' }}>
          bottom:0
          <br />
          no pad
        </div>
      </div>

      {/* Reference horizontal line at exactly env(safe-area-inset-bottom) above the visual viewport bottom — useful as a baseline */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'env(safe-area-inset-bottom)',
          height: 2,
          background: '#000',
          zIndex: 99,
        }}
        aria-hidden
      />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: '#ff00ff',
          zIndex: 99,
        }}
        aria-hidden
      />
    </div>
  )
}
