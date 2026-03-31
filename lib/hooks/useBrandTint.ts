'use client'

import { useState, useEffect } from 'react'
import {
  extractLogoDominantColor,
  getSafeUiTintFromColor,
  buildBrandedDetailGradient,
  getFallbackDetailTint,
} from '@/lib/utils/brandColor'

export interface BrandTint {
  /** CSS gradient string to use as background */
  gradient: string
  /** True once extraction has completed (success or fallback) */
  ready: boolean
}

const FALLBACK: BrandTint = { gradient: getFallbackDetailTint(), ready: true }

/**
 * Extracts a soft atmospheric tint color from a logo URL and returns it as
 * a CSS gradient string. Falls back gracefully on CORS failures or when no
 * sufficiently colorful pixel is found.
 * Starts with the fallback so the layer is always visible immediately.
 */
export function useBrandTint(logoUrl: string | null | undefined): BrandTint {
  const [tint, setTint] = useState<BrandTint>(FALLBACK)

  useEffect(() => {
    if (!logoUrl) { setTint(FALLBACK); return }

    let cancelled = false

    extractLogoDominantColor(logoUrl).then(color => {
      if (cancelled) return
      if (!color) { setTint(FALLBACK); return }

      const [r, g, b] = color
      const tintColor = getSafeUiTintFromColor(r, g, b)
      setTint({ gradient: buildBrandedDetailGradient(tintColor), ready: true })
    })

    return () => { cancelled = true }
  }, [logoUrl])

  return tint
}
