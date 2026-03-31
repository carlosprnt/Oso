// ─── HSL/RGB conversion helpers ───────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const nr = r / 255, ng = g / 255, nb = b / 255
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === nr)      h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6
  else if (max === ng) h = ((nb - nr) / d + 2) / 6
  else                 h = ((nr - ng) / d + 4) / 6
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h) * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ]
}

// ─── In-memory color cache ─────────────────────────────────────────────────────

const colorCache = new Map<string, [number, number, number] | null>()

// ─── Extraction ───────────────────────────────────────────────────────────────

/**
 * Loads an image into a 24×24 canvas and returns the most vibrant pixel.
 * Returns null if the image is CORS-restricted, fails to load, or is too
 * desaturated to be useful.
 */
export async function extractLogoDominantColor(
  imageUrl: string,
): Promise<[number, number, number] | null> {
  if (typeof document === 'undefined') return null
  if (colorCache.has(imageUrl)) return colorCache.get(imageUrl)!

  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const done = (result: [number, number, number] | null) => {
      colorCache.set(imageUrl, result)
      resolve(result)
    }

    img.onload = () => {
      try {
        const SIZE = 24
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) return done(null)

        ctx.drawImage(img, 0, 0, SIZE, SIZE)
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

        let bestColor: [number, number, number] = [128, 128, 128]
        let bestScore = -1

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
          if (a < 100) continue                     // skip transparent pixels
          const [, s, l] = rgbToHsl(r, g, b)
          // Penalise very dark (<15%) and very light (>85%) pixels
          if (l < 0.15 || l > 0.85) continue
          if (s > bestScore) { bestScore = s; bestColor = [r, g, b] }
        }

        // Require a minimum saturation to be considered "colorful"
        done(bestScore > 0.12 ? bestColor : null)
      } catch {
        done(null)
      }
    }

    img.onerror = () => done(null)
    // Re-trigger load after setting crossOrigin
    img.src = imageUrl
  })
}

// ─── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Converts a raw logo color into a soft UI tint:
 * – Saturation  →  clamped to 25–38 % (removes harshness)
 * – Lightness   →  pushed to 62–74 % (keeps text legible over it)
 */
export function getSafeUiTintFromColor(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b)
  const safeS = Math.min(s * 0.65, 0.38)               // desaturate significantly
  const safeL = Math.max(0.62, Math.min(l * 0.9 + 0.12, 0.74))  // lighten/clamp
  const [fr, fg, fb] = hslToRgb(h, safeS, safeL)
  return `rgb(${fr}, ${fg}, ${fb})`
}

// ─── Gradient builder ─────────────────────────────────────────────────────────

/**
 * Builds the CSS gradient string for the branded atmospheric tint.
 * A radial "glow" at the top center fades into nothing; a narrow linear
 * strip at the very top gives it a slight edge warmth.
 */
export function buildBrandedDetailGradient(tintColor: string): string {
  return [
    `radial-gradient(ellipse 160% 90% at 50% -5%, ${tintColor} 0%, transparent 68%)`,
    `linear-gradient(to bottom, ${tintColor} 0%, transparent 35%)`,
  ].join(', ')
}

/** Fallback gradient — a barely-there warm neutral, used when extraction fails */
export function getFallbackDetailTint(): string {
  return 'radial-gradient(ellipse 160% 90% at 50% -5%, rgb(210, 210, 218) 0%, transparent 68%)'
}
