/**
 * Mock Gmail message headers for development/testing.
 * Set GMAIL_MOCK=true in .env.local to use these instead of real Gmail.
 */
import type { GmailMessageHeader } from '@/lib/subscription-detection'

export const MOCK_GMAIL_MESSAGES: GmailMessageHeader[] = [
  // Netflix — 3 months → high confidence
  { id: '1', from: 'Netflix <info@mailer.netflix.com>', subject: 'Your Netflix receipt for March 2025 — $15.49', date: 'Sat, 01 Mar 2025 08:00:00 +0000' },
  { id: '2', from: 'Netflix <info@mailer.netflix.com>', subject: 'Your Netflix receipt for February 2025 — $15.49', date: 'Sat, 01 Feb 2025 08:00:00 +0000' },
  { id: '3', from: 'Netflix <info@mailer.netflix.com>', subject: 'Your Netflix receipt for January 2025', date: 'Wed, 01 Jan 2025 08:00:00 +0000' },

  // Spotify — 2 months → high confidence
  { id: '4', from: 'Spotify <no-reply@spotify.com>', subject: 'Your Spotify Premium receipt – €9.99', date: 'Mon, 03 Mar 2025 10:00:00 +0000' },
  { id: '5', from: 'Spotify <no-reply@spotify.com>', subject: 'Your Spotify Premium receipt – €9.99', date: 'Sat, 01 Feb 2025 10:00:00 +0000' },

  // ChatGPT Plus — 2 months → high confidence
  { id: '6', from: 'OpenAI <billing@openai.com>', subject: 'Your ChatGPT Plus subscription receipt — $20.00', date: 'Tue, 04 Mar 2025 09:00:00 +0000' },
  { id: '7', from: 'OpenAI <billing@openai.com>', subject: 'Your ChatGPT Plus subscription receipt — $20.00', date: 'Sun, 02 Feb 2025 09:00:00 +0000' },

  // GitHub — 1 email → medium confidence
  { id: '8', from: 'GitHub <noreply@github.com>', subject: 'GitHub Pro subscription receipt — $4.00/month', date: 'Mon, 03 Mar 2025 12:00:00 +0000' },

  // Adobe — 2 months → high confidence
  { id: '9', from: 'Adobe <billing@adobe.com>', subject: 'Adobe Creative Cloud — your monthly payment of $54.99', date: 'Fri, 07 Mar 2025 11:00:00 +0000' },
  { id: '10', from: 'Adobe <billing@adobe.com>', subject: 'Adobe Creative Cloud — your monthly payment of $54.99', date: 'Fri, 07 Feb 2025 11:00:00 +0000' },

  // Disney+ — 1 email → medium confidence
  { id: '11', from: 'Disney+ <noreply@disneyplus.com>', subject: 'Your Disney+ subscription renewal — €8.99/month', date: 'Sat, 01 Mar 2025 07:00:00 +0000' },

  // Notion — 1 email, no amount → medium confidence
  { id: '12', from: 'Notion <billing@notion.so>', subject: 'Your Notion Plus subscription renewal', date: 'Mon, 17 Feb 2025 16:00:00 +0000' },
]
