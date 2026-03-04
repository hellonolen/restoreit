// POST /api/partner/register — Register as a RaaS partner (requires authenticated session)
// Returns API key (shown ONCE, never again) and webhook secret.

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { partners } from '@/db/schema'
import { eq } from 'drizzle-orm'
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
    tier: 'starter',
    rateLimit: 100,
    monthlyGbLimit: 50,
    createdAt: new Date(),
  })

  // Return the key — this is the ONLY time it will be shown
  return json({
    partner_id: partnerId,
    name,
    tier: 'starter',
    api_key: apiKey,
    webhook_secret: webhookSecret,
    rate_limit: 100,
    monthly_gb_limit: 50,
    warning: 'Save your API key now. It will not be shown again.',
  }, 201)
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
