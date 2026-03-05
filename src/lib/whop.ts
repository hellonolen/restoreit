const WHOP_API_URL = 'https://api.whop.com/v5'

function getHeaders() {
  const apiKey = process.env.WHOP_API_KEY
  if (!apiKey) {
    throw new Error('WHOP_API_KEY not configured')
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

interface CreateCheckoutParams {
  planId: string
  userId: string
  tier: 'standard' | 'pro' | 'protection' | 'starter' | 'growth' | 'enterprise'
  quantity?: number
  redirectUrl: string
  checkoutType?: 'consumer' | 'partner'
  scanId?: string
}

export async function createCheckoutSession({
  planId,
  userId,
  tier,
  quantity = 1,
  redirectUrl,
  checkoutType = 'consumer',
  scanId,
}: CreateCheckoutParams): Promise<string> {
  const response = await fetch(`${WHOP_API_URL}/checkout_sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      plan_id: planId,
      quantity,
      metadata: {
        user_id: userId,
        tier,
        checkout_type: checkoutType,
        ...(scanId ? { scan_id: scanId } : {}),
        ...(checkoutType === 'partner'
          ? { locations: String(quantity) }
          : { devices: String(quantity) }),
      },
      redirect_url: redirectUrl,
    }),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Checkout creation failed' }))) as { message?: string }
    throw new Error(`Whop error: ${error.message}`)
  }

  const data = (await response.json()) as { purchase_url?: string; url?: string }
  return data.purchase_url || data.url || ''
}

export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('WHOP_WEBHOOK_SECRET not configured')
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const signatureBytes = Uint8Array.from(
    atob(signature),
    c => c.charCodeAt(0)
  )

  return crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(body))
}

// Whop plan IDs — set these in environment variables
export const WHOP_PLANS: Record<string, string> = {
  // Consumer tiers
  standard: process.env.WHOP_PLAN_STANDARD ?? '',
  pro: process.env.WHOP_PLAN_PRO ?? '',
  protection: process.env.WHOP_PLAN_PROTECTION ?? '',
  // Partner tiers
  starter: process.env.WHOP_PLAN_PARTNER_STARTER ?? '',
  growth: process.env.WHOP_PLAN_PARTNER_GROWTH ?? '',
  enterprise: process.env.WHOP_PLAN_PARTNER_ENTERPRISE ?? '',
}

export const PARTNER_TIERS = ['starter', 'growth', 'enterprise'] as const
export const CONSUMER_TIERS = ['standard', 'pro', 'protection'] as const
