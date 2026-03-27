import type { Category, BillingPeriod } from '@/types'

export interface PlatformPreset {
  name: string
  slug: string
  domain: string
  category: Category
  defaultPrice?: number
  defaultBillingPeriod?: BillingPeriod
}

export const PLATFORMS: PlatformPreset[] = [
  // Streaming
  { name: 'Netflix',              slug: 'netflix',           domain: 'netflix.com',           category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'YouTube Premium',      slug: 'youtube-premium',   domain: 'youtube.com',           category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'Disney+',              slug: 'disney-plus',       domain: 'disneyplus.com',        category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'Apple TV+',            slug: 'apple-tv',          domain: 'tv.apple.com',          category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'Amazon Prime Video',   slug: 'prime-video',       domain: 'primevideo.com',        category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'HBO Max',              slug: 'hbo-max',           domain: 'max.com',               category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'Hulu',                 slug: 'hulu',              domain: 'hulu.com',              category: 'streaming',    defaultBillingPeriod: 'monthly' },
  { name: 'National Geographic',  slug: 'nat-geo',           domain: 'nationalgeographic.com',category: 'streaming',    defaultBillingPeriod: 'monthly' },

  // Music
  { name: 'Spotify',              slug: 'spotify',           domain: 'spotify.com',           category: 'music',        defaultBillingPeriod: 'monthly' },
  { name: 'Apple Music',          slug: 'apple-music',       domain: 'music.apple.com',       category: 'music',        defaultBillingPeriod: 'monthly' },

  // Productivity
  { name: 'Notion',               slug: 'notion',            domain: 'notion.so',             category: 'productivity', defaultBillingPeriod: 'monthly' },
  { name: 'Evernote',             slug: 'evernote',          domain: 'evernote.com',          category: 'productivity', defaultBillingPeriod: 'monthly' },
  { name: 'Basecamp',             slug: 'basecamp',          domain: 'basecamp.com',          category: 'productivity', defaultBillingPeriod: 'monthly' },
  { name: 'Slack',                slug: 'slack',             domain: 'slack.com',             category: 'productivity', defaultBillingPeriod: 'monthly' },
  { name: 'Adobe Creative Cloud', slug: 'adobe-cc',          domain: 'adobe.com',             category: 'productivity', defaultBillingPeriod: 'monthly' },
  { name: 'GitHub',               slug: 'github',            domain: 'github.com',            category: 'productivity', defaultBillingPeriod: 'monthly' },

  // Cloud / Storage
  { name: 'iCloud+',              slug: 'icloud',            domain: 'icloud.com',            category: 'cloud',        defaultBillingPeriod: 'monthly' },
  { name: 'Google One',           slug: 'google-one',        domain: 'one.google.com',        category: 'cloud',        defaultBillingPeriod: 'monthly' },
  { name: 'Microsoft OneDrive',   slug: 'onedrive',          domain: 'microsoft.com',         category: 'cloud',        defaultBillingPeriod: 'monthly' },
  { name: 'Amazon Web Services',  slug: 'aws',               domain: 'aws.amazon.com',        category: 'cloud',        defaultBillingPeriod: 'monthly' },
  { name: 'DigitalOcean',         slug: 'digitalocean',      domain: 'digitalocean.com',      category: 'cloud',        defaultBillingPeriod: 'monthly' },
  { name: 'Namecheap',            slug: 'namecheap',         domain: 'namecheap.com',         category: 'cloud',        defaultBillingPeriod: 'yearly'  },
  { name: 'Google Domains',       slug: 'google-domains',    domain: 'domains.google',        category: 'cloud',        defaultBillingPeriod: 'yearly'  },

  // AI
  { name: 'ChatGPT Plus',         slug: 'chatgpt',           domain: 'openai.com',            category: 'ai',           defaultPrice: 20, defaultBillingPeriod: 'monthly' },

  // Gaming
  { name: 'PlayStation Plus',     slug: 'ps-plus',           domain: 'playstation.com',       category: 'gaming',       defaultBillingPeriod: 'monthly' },
  { name: 'Xbox Game Pass',       slug: 'xbox-game-pass',    domain: 'xbox.com',              category: 'gaming',       defaultBillingPeriod: 'monthly' },
  { name: 'Nintendo Switch Online', slug: 'nintendo-online', domain: 'nintendo.com',          category: 'gaming',       defaultBillingPeriod: 'yearly'  },

  // Education
  { name: 'Medium',               slug: 'medium',            domain: 'medium.com',            category: 'education',    defaultBillingPeriod: 'monthly' },
  { name: 'Coursera',             slug: 'coursera',          domain: 'coursera.org',          category: 'education',    defaultBillingPeriod: 'monthly' },
  { name: 'Skillshare',           slug: 'skillshare',        domain: 'skillshare.com',        category: 'education',    defaultBillingPeriod: 'monthly' },
  { name: 'Duolingo',             slug: 'duolingo',          domain: 'duolingo.com',          category: 'education',    defaultBillingPeriod: 'monthly' },

  // Finance / Other
  { name: 'Amazon Prime',         slug: 'amazon-prime',      domain: 'amazon.com',            category: 'other',        defaultBillingPeriod: 'yearly'  },
  { name: 'PayPal',               slug: 'paypal',            domain: 'paypal.com',            category: 'other',        defaultBillingPeriod: 'monthly' },
  { name: 'Revolut',              slug: 'revolut',           domain: 'revolut.com',           category: 'other',        defaultBillingPeriod: 'monthly' },
  { name: 'Wise',                 slug: 'wise',              domain: 'wise.com',              category: 'other',        defaultBillingPeriod: 'monthly' },
  { name: 'American Express',     slug: 'amex',              domain: 'americanexpress.com',   category: 'other',        defaultBillingPeriod: 'yearly'  },
]

export function getPlatformLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`
}
