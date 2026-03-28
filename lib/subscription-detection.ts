/**
 * Heuristic-based subscription detection from Gmail message headers.
 *
 * Strategy: deterministic, easy to understand, easy to improve.
 * - Match sender domain against a known platform map
 * - Filter by subscription-related subject keywords
 * - Parse amount/currency from subject text
 * - Infer billing period from subject text
 * - Group by domain to surface recurring senders
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
}

// ─── Platform sender map ───────────────────────────────────────────────────────
// Maps the last two parts of a sender's email domain (e.g. "netflix.com")
// to a platform catalog ID. When multiple domains share a platform (e.g. Apple),
// list them all pointing to the best default match.

const DOMAIN_TO_PLATFORM_ID: Record<string, string> = {
  // Streaming
  'netflix.com': 'netflix',
  'nflximg.com': 'netflix',
  'disneyplus.com': 'disney-plus',
  'hbomax.com': 'hbo-max',
  'hulu.com': 'hulu',
  'paramountplus.com': 'other',
  'peacocktv.com': 'other',

  // Music
  'spotify.com': 'spotify',

  // Apple — maps to iCloud+ as the most common Apple subscription
  // subject-based refinement is aspirational; good enough for MVP
  'apple.com': 'icloud-plus',

  // Google
  'google.com': 'google-one',
  'youtube.com': 'youtube-premium',
  'googleplay.com': 'google-one',

  // Productivity
  'notion.so': 'notion',
  'evernote.com': 'evernote',
  'basecamp.com': 'basecamp',
  'slack.com': 'slack',
  'adobe.com': 'adobe-creative-cloud',
  'github.com': 'github',
  'github.io': 'github',

  // Cloud
  'amazonaws.com': 'aws',
  'digitalocean.com': 'digitalocean',
  'namecheap.com': 'namecheap',

  // AI
  'openai.com': 'chatgpt-plus',

  // Gaming
  'playstation.com': 'playstation-plus',
  'xbox.com': 'xbox-game-pass',
  'nintendo.com': 'nintendo-switch-online',

  // Education
  'medium.com': 'medium',
  'coursera.org': 'coursera',
  'skillshare.com': 'skillshare',
  'duolingo.com': 'duolingo',

  // Finance / Other
  'amazon.com': 'amazon-prime',
  'paypal.com': 'paypal',
  'revolut.com': 'revolut',
  'wise.com': 'wise',
  'transferwise.com': 'wise',
  'americanexpress.com': 'american-express',
  'microsoft.com': 'microsoft-onedrive',
}

// ─── Subscription subject keywords ────────────────────────────────────────────

const SUBSCRIPTION_KEYWORDS = [
  'receipt', 'invoice', 'subscription', 'renewal', 'billing',
  'charged', 'plan', 'payment', 'membership', 'billed',
  'your order', 'confirmation', 'annual', 'monthly', 'renew',
  'renewed', 'your bill', 'statement', 'new charge', 'auto-renewal',
  'auto renewal', 'successful payment', 'payment processed', 'payment received',
  'payment confirmation', 'order confirmation', 'thank you for your payment',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the last-two-part domain from a From header like "Netflix <billing@mailer.netflix.com>" */
function extractNormalizedDomain(from: string): string | null {
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? emailMatch[1] ?? emailMatch[0] : from.trim()
  const domainMatch = email.match(/@([^>]+)$/)
  if (!domainMatch) return null
  const domain = domainMatch[1].toLowerCase().replace('>', '').trim()
  const parts = domain.split('.')
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain
}

/** Extract the full sender domain (keeping subdomains) for the source_hint display */
function extractFullDomain(from: string): string | null {
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? emailMatch[1] ?? emailMatch[0] : from.trim()
  const domainMatch = email.match(/@([^>]+)$/)
  return domainMatch ? domainMatch[1].toLowerCase().replace('>', '').trim() : null
}

/** Extract display name from "Display Name <email@domain>" */
function extractDisplayName(from: string): string {
  const nameMatch = from.match(/^"?([^"<]+)"?\s*</)
  if (nameMatch) return nameMatch[1].trim().replace(/["']/g, '')
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
  const email = emailMatch ? (emailMatch[1] ?? emailMatch[0]) : from
  return email.split('@')[0].replace(/[._-]/g, ' ').trim()
}

/** Return true if the subject looks like a subscription/billing email */
function isSubscriptionSubject(subject: string): boolean {
  const lower = subject.toLowerCase()
  return SUBSCRIPTION_KEYWORDS.some(kw => lower.includes(kw))
}

/** Try to parse a price and currency from subject text */
function parseAmount(text: string): { amount: number; currency: string } | null {
  const patterns: Array<{ re: RegExp; currency: string }> = [
    { re: /\$\s?(\d+(?:\.\d{1,2})?)(?!\d)/, currency: 'USD' },
    { re: /€\s?(\d+(?:[,.]\d{1,2})?)(?!\d)/, currency: 'EUR' },
    { re: /£\s?(\d+(?:\.\d{1,2})?)(?!\d)/, currency: 'GBP' },
    { re: /(\d+(?:\.\d{1,2})?)\s?USD(?!\w)/, currency: 'USD' },
    { re: /(\d+(?:[,.]\d{1,2})?)\s?EUR(?!\w)/, currency: 'EUR' },
    { re: /(\d+(?:\.\d{1,2})?)\s?GBP(?!\w)/, currency: 'GBP' },
    { re: /(\d+(?:[,.]\d{2})?)\s?€/, currency: 'EUR' },
  ]
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
  return null
}

/** Infer billing period from subject text */
function parseBillingPeriod(text: string): BillingPeriod | null {
  const lower = text.toLowerCase()
  if (lower.includes('annual') || lower.includes('yearly') || lower.includes('/year') ||
      lower.includes('per year') || lower.includes('1 year') || lower.includes('12 month')) {
    return 'yearly'
  }
  if (lower.includes('monthly') || lower.includes('/month') || lower.includes('per month') ||
      lower.includes('1 month')) {
    return 'monthly'
  }
  if (lower.includes('quarterly') || lower.includes('3 month') || lower.includes('3-month')) {
    return 'quarterly'
  }
  if (lower.includes('weekly') || lower.includes('/week') || lower.includes('per week')) {
    return 'weekly'
  }
  return null
}

/** Infer a display name from a domain when no platform match exists */
function nameFromDomain(domain: string, senderDisplay: string): string {
  const GENERIC = ['billing', 'invoice', 'noreply', 'no-reply', 'notify',
    'notifications', 'info', 'support', 'donotreply', 'hello', 'team']
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
  // 1. Filter to subscription-like subjects
  const relevant = messages.filter(m => isSubscriptionSubject(m.subject))

  // 2. Group by normalized domain (one entry per service)
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
    // Sort newest first
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const latest = sorted[0]

    // Platform lookup
    const platformId = DOMAIN_TO_PLATFORM_ID[domain]
    if (platformId && seenPlatformIds.has(platformId)) continue
    if (platformId) seenPlatformIds.add(platformId)

    const platform = platformId ? getPlatformById(platformId) : undefined
    const name = platform?.name ?? nameFromDomain(domain, extractDisplayName(latest.from))

    // Amount — try up to 5 most recent subjects
    let amountData: { amount: number; currency: string } | null = null
    for (const msg of sorted.slice(0, 5)) {
      const parsed = parseAmount(msg.subject)
      if (parsed) { amountData = parsed; break }
    }

    // Billing period — prefer platform default, then subject scan
    let billingPeriod: BillingPeriod | null = platform?.defaultBillingPeriod ?? null
    if (!billingPeriod) {
      for (const msg of sorted) {
        const parsed = parseBillingPeriod(msg.subject)
        if (parsed) { billingPeriod = parsed; break }
      }
    }

    // Confidence
    const isRecurring = sorted.length >= 2
    const confidence: DetectedSubscription['confidence'] =
      platform && isRecurring ? 'high'
      : platform ? 'medium'
      : isRecurring ? 'medium'
      : 'low'

    // Source hint: full sender domain + latest email month
    const fullDomain = extractFullDomain(latest.from) ?? domain
    const latestDate = new Date(latest.date)
    const dateHint = isNaN(latestDate.getTime())
      ? ''
      : latestDate.toLocaleDateString('en', { month: 'short', year: 'numeric' })
    const sourceHint = dateHint ? `${fullDomain} · ${dateHint}` : fullDomain

    // Logo
    const logoUrl = platform
      ? resolvePlatformLogoUrl(platform)
      : null

    candidates.push({
      id: `gmail-${domain}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      matchedPlatformId: platform?.id,
      logoUrl,
      price_amount: amountData?.amount ?? (platform?.defaultPrice ?? null),
      currency: amountData?.currency ?? null,
      billing_period: billingPeriod,
      source: 'gmail',
      source_hint: sourceHint,
      suggested_category: platform?.category ?? 'other',
      confidence,
    })
  }

  // 3. Sort: high confidence first, then alphabetically
  return candidates.sort((a, b) => {
    const ORDER = { high: 0, medium: 1, low: 2 }
    const diff = ORDER[a.confidence] - ORDER[b.confidence]
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })
}
