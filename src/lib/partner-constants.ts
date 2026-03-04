// Partner Program — constants shared across /partners, /docs/raas, and dashboard

export const CALENDLY_URL = 'https://calendly.com/restoreit/partner-onboarding'

export interface PartnerTier {
  name: string
  slug: 'starter' | 'growth' | 'enterprise'
  pricePerGb: string
  rateLimit: string
  monthlyQuota: string
  features: string[]
  recommended?: boolean
}

export const PARTNER_TIERS: PartnerTier[] = [
  {
    name: 'Starter',
    slug: 'starter',
    pricePerGb: '$0.50',
    rateLimit: '100 req/min',
    monthlyQuota: '50 GB',
    features: [
      'REST API access',
      'Webhook notifications',
      'Usage dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    slug: 'growth',
    pricePerGb: '$0.30',
    rateLimit: '500 req/min',
    monthlyQuota: '500 GB',
    recommended: true,
    features: [
      'Everything in Starter',
      'Priority scanning queue',
      'Bulk upload support',
      'Dedicated support channel',
    ],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    pricePerGb: 'Custom',
    rateLimit: 'Unlimited',
    monthlyQuota: 'Unlimited',
    features: [
      'Everything in Growth',
      'Custom SLA',
      'On-prem deployment option',
      'Dedicated account manager',
    ],
  },
]

export const TIER_RATES: Record<string, number> = {
  starter: 0.50,
  growth: 0.30,
  enterprise: 0.50,
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
    question: 'Is RestoreIt compliant with data protection regulations?',
    answer: 'We follow SOC 2 Type II practices and are GDPR-compliant. Enterprise partners can request a DPA (Data Processing Agreement) and compliance documentation.',
  },
  {
    question: 'What is the typical turnaround time?',
    answer: 'Most scans complete in under 5 minutes for drives up to 500 GB. Larger drives may take longer depending on the scan mode. You receive a webhook when the scan finishes.',
  },
  {
    question: 'How does billing work?',
    answer: 'You are billed per gigabyte scanned at your tier rate. Usage is tracked in real time on your dashboard. Invoices are generated monthly. No minimum commitment on Starter.',
  },
]
