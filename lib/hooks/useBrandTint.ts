'use client'

import { useState, useEffect } from 'react'
import {
  extractLogoDominantColor,
  getSafeUiTintFromColor,
  buildBrandedDetailGradient,
  getFallbackDetailTint,
} from '@/lib/utils/brandColor'

const DARK_BG = 'rgba(28,28,30,0)'
const LIGHT_BG = 'rgba(255,255,255,0)'

export interface BrandTint {
  /** CSS gradient for light mode */
  gradientLight: string
  /** CSS gradient for dark mode (fades toward dark sheet bg) */
  gradientDark: string
}

const FALLBACK: BrandTint = {
  gradientLight: getFallbackDetailTint(LIGHT_BG),
  gradientDark:  getFallbackDetailTint(DARK_BG),
}

/**
 * Extracts a soft atmospheric tint color from a logo URL and returns
 * separate gradients for light and dark mode. Starts with the fallback
 * so the layer is always visible immediately.
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
      setTint({
        gradientLight: buildBrandedDetailGradient(tintColor, LIGHT_BG),
        gradientDark:  buildBrandedDetailGradient(tintColor, DARK_BG),
      })
    })

    return () => { cancelled = true }
  }, [logoUrl])

  return tint
}
