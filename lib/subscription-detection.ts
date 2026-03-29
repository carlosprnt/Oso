/**
 * Heuristic-based subscription detection from Gmail message headers + snippets.
 *
 * Key improvements over v1:
 * - Known domains bypass subject keyword filtering (catches "Enjoy Netflix", etc.)
 * - Spanish + multilingual subject keywords
 * - Amount parsed from BOTH subject and email snippet (body preview)
 * - Broader domain map with Spanish/EU services
 * - Exported KNOWN_DOMAINS list used by the API route to build from: query
 */

import type { DetectedSubscription } from '@/types/detected-subscription'
import type { BillingPeriod } from '@/types'
import { getPlatformById, resolvePlatformLogoUrl } from '@/lib/constants/platforms'

// ─── Raw message data from Gmail API ──────────────────────────────────────────

export interface GmailMessageHeader {
  id: string
  from: string
  subject: string
  date: string
  snippet?: string  // email body preview (~500 chars) — use for amount parsing
}

// ─── Platform sender domain map ───────────────────────────────────────────────
// Key: normalized last-two-part domain (e.g. "netflix.com")
// Value: platform catalog ID

const DOMAIN_TO_PLATFORM_ID: Record<string, string> = {
  // Streaming
  'netflix.com': 'netflix',
  'nflximg.com': 'netflix',
  'disneyplus.com': 'disney-plus',
  'disney.com': 'disney-plus',
  'hbomax.com': 'hbo-max',
  'max.com': 'hbo-max',
  'hulu.com': 'hulu',
  'paramountplus.com': 'other',
  'peacocktv.com': 'other',
  'primevideo.com': 'amazon-prime',
  'crunchyroll.com': 'other',
  'mubi.com': 'other',
  'filmin.es': 'other',
  'atresplayer.com': 'other',
  'mitele.es': 'other',
  'rtve.es': 'other',

  // Music / Podcasts
  'spotify.com': 'spotify',
  'tidal.com': 'other',
  'deezer.com': 'other',
  'music.amazon.com': 'other',

  // Apple
  'apple.com': 'icloud-plus',
  'icloud.com': 'icloud-plus',

  // Google
  'google.com': 'google-one',
  'youtube.com': 'youtube-premium',
  'googleplay.com': 'google-one',

  // Microsoft
  'microsoft.com': 'microsoft-onedrive',
  'xbox.com': 'xbox-game-pass',
  'office.com': 'microsoft-onedrive',
  'live.com': 'microsoft-onedrive',
  'outlook.com': 'microsoft-onedrive',

  // Productivity / SaaS
  'notion.so': 'notion',
  'evernote.com': 'evernote',
  'basecamp.com': 'basecamp',
  'slack.com': 'slack',
  'adobe.com': 'adobe-creative-cloud',
  'github.com': 'github',
  'github.io': 'github',
  'figma.com': 'other',
  'canva.com': 'other',
  'dropbox.com': 'other',
  'box.com': 'other',
  'monday.com': 'other',
  'asana.com': 'other',
  'trello.com': 'other',
  'atlassian.com': 'other',
  'zoom.us': 'other',
  'webex.com': 'other',
  'intercom.io': 'other',
  'mailchimp.com': 'other',
  'hubspot.com': 'other',
  'airtable.com': 'other',
  'miro.com': 'other',
  'loom.com': 'other',
  'linear.app': 'other',
  'craft.do': 'other',
  'readwise.io': 'other',

  // AI / Dev tools
  'openai.com': 'chatgpt-plus',
  'anthropic.com': 'other',
  'midjourney.com': 'other',
  'cursor.sh': 'other',
  'replit.com': 'other',
  'vercel.com': 'other',
  'netlify.com': 'other',
  'render.com': 'other',

  // Cloud / Hosting
  'amazonaws.com': 'aws',
  'digitalocean.com': 'digitalocean',
  'namecheap.com': 'namecheap',
  'godaddy.com': 'other',
  'cloudflare.com': 'other',
  'linode.com': 'other',
  'hetzner.com': 'other',
  'ovhcloud.com': 'other',

  // Gaming
  'playstation.com': 'playstation-plus',
  'nintendo.com': 'nintendo-switch-online',
  'steampowered.com': 'other',
  'epicgames.com': 'other',
  'ubisoft.com': 'other',
  'ea.com': 'other',

  // Education
  'medium.com': 'medium',
  'coursera.org': 'coursera',
  'skillshare.com': 'skillshare',
  'duolingo.com': 'duolingo',
  'udemy.com': 'other',
  'masterclass.com': 'other',
  'domestika.org': 'other',
  'datacamp.com': 'other',
  'pluralsight.com': 'other',
  'linkedin.com': 'other',

  // Finance / Fintech
  'amazon.com': 'amazon-prime',
  'paypal.com': 'paypal',
  'revolut.com': 'revolut',
  'wise.com': 'wise',
  'transferwise.com': 'wise',
  'n26.com': 'other',
  'bunq.com': 'other',
  'monzo.com': 'other',

  // VPN / Security
  'nordvpn.com': 'other',
  'expressvpn.com': 'other',
  'proton.me': 'other',
  'protonmail.com': 'other',
  '1password.com': 'other',
  'lastpass.com': 'other',
  'bitwarden.com': 'other',
  'malwarebytes.com': 'other',

  // News / Reading
  'nytimes.com': 'other',
  'wsj.com': 'other',
  'economist.com': 'other',
  'elpais.com': 'other',
  'elmundo.es': 'other',
  'elconfidencial.com': 'other',
  'expansion.com': 'other',
}

/** All known domains — exported so the API route can build from: queries */
export const KNOWN_DOMAINS = Object.keys(DOMAIN_TO_PLATFORM_ID)

// ─── Subject keywords (English + Spanish + FR/DE/IT) ─────────────────────────

const SUBSCRIPTION_KEYWORDS = [
  // English
  'receipt', 'invoice', 'subscription', 'renewal', 'billing',
  'charged', 'plan', 'payment', 'membership', 'billed',
  'order', 'confirmation', 'annual', 'monthly', 'renew',
  'renewed', 'statement', 'auto-renewal', 'auto renewal',
  'successful payment', 'payment processed', 'payment received',
  'payment confirmation', 'order confirmation', 'thank you for',
  'your subscription', 'your membership', 'your account',
  // Spanish
  'factura', 'recibo', 'suscripción', 'suscripcion', 'renovación', 'renovacion',
  'cobro', 'cargo', 'pago', 'confirmación', 'confirmacion', 'membresía',
  'membresia', 'pedido', 'mensual', 'anual', 'plan', 'gracias por',
  'tu suscripción', 'tu plan', 'pago realizado', 'pago confirmado',
  'confirmación de pago', 'recibo de pago', 'renovación automática',
  // French
  'abonnement', 'reçu', 'facture', 'renouvellement', 'paiement',
  // German
  'rechnung', 'abonnement', 'zahlung', 'kündigung',
  // Italian
  'abbonamento', 'ricevuta', 'fattura', 'rinnovo', 'pagamento',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractNormalizedDomain(from: string): string | null {
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? emailMatch[1] ?? emailMatch[0] : from.trim()
  const domainMatch = email.match(/@([^>]+)$/)
  if (!domainMatch) return null
  const domain = domainMatch[1].toLowerCase().replace('>', '').trim()
  const parts = domain.split('.')
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain
}

function extractFullDomain(from: string): string | null {
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? emailMatch[1] ?? emailMatch[0] : from.trim()
  const domainMatch = email.match(/@([^>]+)$/)
  return domainMatch ? domainMatch[1].toLowerCase().replace('>', '').trim() : null
}

function extractDisplayName(from: string): string {
  const nameMatch = from.match(/^"?([^"<]+)"?\s*</)
  if (nameMatch) return nameMatch[1].trim().replace(/["']/g, '')
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? (emailMatch[1] ?? emailMatch[0]) : from
  return email.split('@')[0].replace(/[._-]/g, ' ').trim()
}

function isSubscriptionSubject(subject: string): boolean {
  const lower = subject.toLowerCase()
  return SUBSCRIPTION_KEYWORDS.some(kw => lower.includes(kw))
}

/** Parse price from text — tries subject first, then snippet */
function parseAmount(texts: string[]): { amount: number; currency: string } | null {
  const patterns: Array<{ re: RegExp; currency: string }> = [
    // Symbol prefix: $9.99, €9.99, £9.99
    { re: /\$\s?(\d+(?:[.,]\d{1,2})?)(?!\d)/, currency: 'USD' },
    { re: /€\s?(\d+(?:[.,]\d{1,2})?)(?!\d)/,  currency: 'EUR' },
    { re: /£\s?(\d+(?:[.,]\d{1,2})?)(?!\d)/,  currency: 'GBP' },
    // Symbol suffix: 9,99€ or 9.99€ or 9 €
    { re: /(\d+(?:[.,]\d{1,2})?)\s?€/, currency: 'EUR' },
    { re: /(\d+(?:[.,]\d{1,2})?)\s?\$/, currency: 'USD' },
    { re: /(\d+(?:[.,]\d{1,2})?)\s?£/, currency: 'GBP' },
    // ISO code suffix: 9.99 USD/EUR/GBP
    { re: /(\d+(?:[.,]\d{1,2})?)\s?USD(?!\w)/, currency: 'USD' },
    { re: /(\d+(?:[.,]\d{1,2})?)\s?EUR(?!\w)/, currency: 'EUR' },
    { re: /(\d+(?:[.,]\d{1,2})?)\s?GBP(?!\w)/, currency: 'GBP' },
  ]

  for (const text of texts) {
    for (const { re, currency } of patterns) {
      const match = text.match(re)
      if (match) {
        const raw = match[1].replace(',', '.')
        const amount = parseFloat(raw)
        if (!isNaN(amount) && amount > 0 && amount < 10_000) {
          return { amount, currency }
        }
      }
    }
  }
  return null
}

function parseBillingPeriod(texts: string[]): BillingPeriod | null {
  for (const text of texts) {
    const lower = text.toLowerCase()
    if (lower.match(/\b(annual|yearly|year|anual|año|anualmente|per\s+year|\/year|12.month)\b/)) {
      return 'yearly'
    }
    if (lower.match(/\b(monthly|month|mensual|mes|mensualmente|per\s+month|\/month|1.month)\b/)) {
      return 'monthly'
    }
    if (lower.match(/\b(quarterly|quarter|trimestral|trimestre|3.month)\b/)) {
      return 'quarterly'
    }
    if (lower.match(/\b(weekly|week|semanal|semana|\/week)\b/)) {
      return 'weekly'
    }
  }
  return null
}

function nameFromDomain(domain: string, senderDisplay: string): string {
  const GENERIC = [
    'billing', 'invoice', 'noreply', 'no-reply', 'notify',
    'notifications', 'info', 'support', 'donotreply', 'hello',
    'team', 'mail', 'mailer', 'newsletter', 'news',
  ]
  const cleaned = senderDisplay.toLowerCase().replace(/\s/g, '')
  if (!GENERIC.includes(cleaned) && senderDisplay.length > 2 && !/\d/.test(senderDisplay)) {
    return senderDisplay.charAt(0).toUpperCase() + senderDisplay.slice(1)
  }
  const base = domain.split('.')[0]
  return base.charAt(0).toUpperCase() + base.slice(1)
}

// ─── Main detection function ───────────────────────────────────────────────────

export function detectSubscriptionsFromEmails(
  messages: GmailMessageHeader[],
): DetectedSubscription[] {
  // For KNOWN domains → include regardless of subject (catches "Enjoy Netflix", etc.)
  // For UNKNOWN domains → require a subscription-related subject
  const relevant = messages.filter(m => {
    const domain = extractNormalizedDomain(m.from)
    if (domain && DOMAIN_TO_PLATFORM_ID[domain]) return true
    return isSubscriptionSubject(m.subject)
  })

  // Group by normalized domain
  const byDomain = new Map<string, GmailMessageHeader[]>()
  for (const msg of relevant) {
    const domain = extractNormalizedDomain(msg.from)
    if (!domain) continue
    if (!byDomain.has(domain)) byDomain.set(domain, [])
    byDomain.get(domain)!.push(msg)
  }

  const candidates: DetectedSubscription[] = []
  const seenPlatformIds = new Set<string>()

  for (const [domain, msgs] of byDomain) {
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const latest = sorted[0]

    const platformId = DOMAIN_TO_PLATFORM_ID[domain]
    if (platformId && seenPlatformIds.has(platformId)) continue
    if (platformId) seenPlatformIds.add(platformId)

    const platform = platformId ? getPlatformById(platformId) : undefined
    const name = platform?.name ?? nameFromDomain(domain, extractDisplayName(latest.from))

    // Amount — try subjects then snippets of up to 5 most recent messages
    const textsForAmount = sorted.slice(0, 5).flatMap(m => [m.subject, m.snippet ?? ''])
    const amountData = parseAmount(textsForAmount)

    // Billing period — platform default wins, then scan subjects + snippets
    const textsForPeriod = sorted.flatMap(m => [m.subject, m.snippet ?? ''])
    const billingPeriod: BillingPeriod =
      platform?.defaultBillingPeriod ??
      parseBillingPeriod(textsForPeriod) ??
      'monthly'

    const isRecurring = sorted.length >= 2
    const confidence: DetectedSubscription['confidence'] =
      platform && isRecurring ? 'high'
      : platform || isRecurring ? 'medium'
      : 'low'

    const fullDomain = extractFullDomain(latest.from) ?? domain
    const latestDate = new Date(latest.date)
    const dateHint = isNaN(latestDate.getTime())
      ? ''
      : latestDate.toLocaleDateString('es', { month: 'short', year: 'numeric' })
    const sourceHint = dateHint ? `${fullDomain} · ${dateHint}` : fullDomain

    const logoUrl = platform ? resolvePlatformLogoUrl(platform) : null

    candidates.push({
      id: `gmail-${domain}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      matchedPlatformId: platform?.id,
      logoUrl,
      price_amount: amountData?.amount ?? (platform?.defaultPrice ?? null),
      currency: amountData?.currency ?? (amountData ? null : 'EUR'),
      billing_period: billingPeriod,
      source: 'gmail',
      source_hint: sourceHint,
      suggested_category: platform?.category ?? 'other',
      confidence,
    })
  }

  return candidates.sort((a, b) => {
    const ORDER = { high: 0, medium: 1, low: 2 }
    const diff = ORDER[a.confidence] - ORDER[b.confidence]
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })
}
