/** Maps app locale codes to BCP 47 locale strings for Intl formatting. */
const LOCALE_MAP: Record<string, string> = { en: 'en-US', es: 'es-ES' }

function resolveLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? locale
}

/**
 * Formats a monetary amount using the browser's Intl API.
 * Removes non-breaking spaces so "9,99 €" becomes "9,99€".
 * Pass the app locale ('en' or 'es') or a full BCP 47 tag.
 * Defaults to 'es' to preserve existing Spanish formatting.
 */
export function formatCurrency(
  amount: number,
  currency = 'EUR',
  locale = 'es'
): string {
  if (!isFinite(amount)) return `${currency} –`
  const bcp = resolveLocale(locale)
  try {
    const raw = new Intl.NumberFormat(bcp, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount)
    // Remove non-breaking space (\u00A0) and narrow no-break space (\u202F)
    // so symbols attach directly: "9,99€" not "9,99 €"
    return raw.replace(/[\u00A0\u202F]/g, '')
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * Compact format for large amounts (e.g. 1.2K, 2.4K)
 */
export function formatCurrencyCompact(
  amount: number,
  currency = 'EUR',
  locale = 'es'
): string {
  if (!isFinite(amount)) return `${currency} –`
  if (amount < 1000) return formatCurrency(amount, currency, locale)
  const bcp = resolveLocale(locale)
  try {
    const raw = new Intl.NumberFormat(bcp, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
    return raw.replace(/[\u00A0\u202F]/g, '')
  } catch {
    return `${currency} ${(amount / 1000).toFixed(1)}K`
  }
}

/**
 * Formats just the number part without currency symbol.
 */
export function formatAmount(amount: number, locale = 'es'): string {
  const bcp = resolveLocale(locale)
  return new Intl.NumberFormat(bcp, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
