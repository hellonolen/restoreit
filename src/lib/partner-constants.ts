// Partner Program — constants shared across /partners, /docs/raas, and dashboard

export interface PartnerTier {
  name: string
  slug: 'starter' | 'growth' | 'enterprise'
  price: number
  period: string
  scanVolume: string
  scanVolumeGB: number
  jobLimit: string
  jobLimitNum: number
  rateLimit: string
  rateLimitNum: number
  features: string[]
  recommended?: boolean
}

export const PARTNER_TIERS: PartnerTier[] = [
  {
    name: 'Starter',
    slug: 'starter',
    price: 199,
    period: '/mo',
    scanVolume: '100 GB',
    scanVolumeGB: 100,
    jobLimit: '50 jobs',
    jobLimitNum: 50,
    rateLimit: '30 req/min',
    rateLimitNum: 30,
    features: [
      'REST API access',
      'MCP Server access',
      'Webhook notifications',
      'Usage dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    slug: 'growth',
    price: 599,
    period: '/mo',
    scanVolume: '1 TB',
    scanVolumeGB: 1024,
    jobLimit: '200 jobs',
    jobLimitNum: 200,
    rateLimit: '120 req/min',
    rateLimitNum: 120,
    recommended: true,
    features: [
      'Everything in Starter',
      'Priority scanning queue',
      'Bulk upload support',
      'Advanced analytics dashboard',
    ],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 999,
    period: '/mo',
    scanVolume: '5 TB',
    scanVolumeGB: 5120,
    jobLimit: '1,000 jobs',
    jobLimitNum: 1000,
    rateLimit: '500 req/min',
    rateLimitNum: 500,
    features: [
      'Everything in Growth',
      'Custom SLA',
      'Custom scan profiles',
      'Extended data retention',
    ],
  },
]

export const TIER_MONTHLY_PRICE: Record<string, number> = {
  starter: 199,
  growth: 599,
  enterprise: 999,
}

export interface PartnerFAQ {
  question: string
  answer: string
}

export const PARTNER_FAQS: PartnerFAQ[] = [
  {
    question: 'How is customer data secured?',
    answer: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Disk images are stored in isolated R2 buckets per scan. We never share data between partners or scans.',
  },
  {
    question: 'How long is restored data retained?',
    answer: 'Restored files are available for 30 days after scan completion. Partners can request extended retention on the Growth and Enterprise tiers.',
  },
  {
    question: 'Is restoreit compliant with data protection regulations?',
    answer: 'We follow SOC 2 Type II practices and are GDPR-compliant. Enterprise partners can request a DPA (Data Processing Agreement) and compliance documentation.',
  },
  {
    question: 'What is the typical turnaround time?',
    answer: 'Most scans complete in under 5 minutes for drives up to 500 GB. Larger drives may take longer depending on the scan mode. You receive a webhook when the scan finishes.',
  },
  {
    question: 'How does billing work?',
    answer: 'Flat monthly subscription based on scan volume. Pick your tier, pay one price, use your included volume. No per-GB metering, no surprise charges. Need more? Upgrade to the next tier anytime. Usage is tracked in real time on your dashboard.',
  },
]
