// POST /api/partner/register — Register as a RaaS partner (requires authenticated session)
// Returns API key (shown ONCE, never again) and webhook secret.

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { partners, payments } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { generateApiKey, generateWebhookSecret, hashApiKey } from '@/lib/api-auth'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  if (!user) {
    return json({ error: 'Authentication required' }, 401)
  }

  let body: { name?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const name = body.name?.trim()
  if (!name || name.length < 2) {
    return json({ error: 'Partner name is required (min 2 characters)' }, 400)
  }

  const email = body.email?.trim().toLowerCase() ?? user.email

  const db = await getDb()

  // Check if user already has a partner account
  const existing = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1)

  if (existing.length > 0) {
    return json({ error: 'You already have a partner account. Use /api/partner/keys to manage keys.' }, 409)
  }

  // Check if user already has a completed partner-tier payment
  const partnerTiers = ['starter', 'growth', 'enterprise'] as const
  const rateLimits: Record<string, number> = { starter: 100, growth: 500, enterprise: 10000 }
  const gbLimits: Record<string, number | null> = { starter: 100, growth: 1000, enterprise: null }

  const paidPartner = await db
    .select({ tier: payments.tier })
    .from(payments)
    .where(and(
      eq(payments.userId, user.id),
      eq(payments.status, 'completed'),
      inArray(payments.tier, partnerTiers),
    ))
    .orderBy(payments.createdAt)
    .limit(1)

  const tier = (paidPartner.length > 0 ? paidPartner[0].tier : 'starter') as 'starter' | 'growth' | 'enterprise'

  const apiKey = generateApiKey()
  const webhookSecret = generateWebhookSecret()
  const keyHash = await hashApiKey(apiKey)
  const partnerId = crypto.randomUUID()

  await db.insert(partners).values({
    id: partnerId,
    userId: user.id,
    name,
    email,
    apiKeyHash: keyHash,
    webhookSecret,
    tier,
    rateLimit: rateLimits[tier] ?? 100,
    monthlyGbLimit: gbLimits[tier] ?? 100,
    createdAt: new Date(),
  })

  // Return the key — this is the ONLY time it will be shown
  return json({
    partner_id: partnerId,
    name,
    tier,
    api_key: apiKey,
    webhook_secret: webhookSecret,
    rate_limit: rateLimits[tier] ?? 100,
    monthly_gb_limit: gbLimits[tier] ?? 100,
    warning: 'Save your API key now. It will not be shown again.',
  }, 201)
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
