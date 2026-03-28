import type { BillingPeriod, Category } from './index'

/**
 * A subscription candidate detected from Gmail.
 * These are suggestions — the user must confirm before they become real subscriptions.
 */
export interface DetectedSubscription {
  /** Unique candidate ID (temporary, not saved to DB) */
  id: string
  /** Service name (from platform catalog or inferred from sender) */
  name: string
  /** Matched platform catalog ID, if found */
  matchedPlatformId?: string
  /** Resolved logo URL (Simple Icons CDN or null for initials fallback) */
  logoUrl?: string | null
  /** Detected price, or null if not found in email */
  price_amount: number | null
  /** Detected currency code, or null if not found */
  currency: string | null
  /** Inferred billing period, or null if not determinable */
  billing_period: BillingPeriod | null
  source: 'gmail'
  /** Human-readable hint: sender address and latest email date */
  source_hint: string
  suggested_category: Category
  /** Confidence in the detection quality */
  confidence: 'high' | 'medium' | 'low'
}
