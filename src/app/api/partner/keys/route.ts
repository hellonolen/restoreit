// GET    /api/partner/keys — List partner info (no key shown)
// POST   /api/partner/keys — Rotate API key (generates new one, invalidates old)
// DELETE /api/partner/keys — Deactivate partner account

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { partners } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateApiKey, hashApiKey } from '@/lib/api-auth'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  if (!user) return json({ error: 'Authentication required' }, 401)

  const db = await getDb()
  const rows = await db
    .select({
      id: partners.id,
      name: partners.name,
      email: partners.email,
      tier: partners.tier,
      rateLimit: partners.rateLimit,
      monthlyGbLimit: partners.monthlyGbLimit,
      isActive: partners.isActive,
      createdAt: partners.createdAt,
    })
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1)

  if (rows.length === 0) {
    return json({ error: 'No partner account found. Register at /api/partner/register.' }, 404)
  }

  const p = rows[0]
  return json({
    partner_id: p.id,
    name: p.name,
    email: p.email,
    tier: p.tier,
    rate_limit: p.rateLimit,
    monthly_gb_limit: p.monthlyGbLimit,
    is_active: p.isActive,
    created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt as unknown as number).toISOString(),
    api_key_hint: 'rstr_live_****',
  })
}

export async function POST() {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  if (!user) return json({ error: 'Authentication required' }, 401)

  const db = await getDb()
  const rows = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1)

  if (rows.length === 0) {
    return json({ error: 'No partner account found' }, 404)
  }

  // Generate new key, hash it, update
  const newKey = generateApiKey()
  const newHash = await hashApiKey(newKey)

  await db
    .update(partners)
    .set({ apiKeyHash: newHash })
    .where(eq(partners.id, rows[0].id))

  return json({
    partner_id: rows[0].id,
    api_key: newKey,
    warning: 'Save your new API key now. The old key is permanently invalidated.',
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  if (!user) return json({ error: 'Authentication required' }, 401)

  const db = await getDb()
  const rows = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1)

  if (rows.length === 0) {
    return json({ error: 'No partner account found' }, 404)
  }

  await db
    .update(partners)
    .set({ isActive: false })
    .where(eq(partners.id, rows[0].id))

  return json({ message: 'Partner account deactivated. API key is now invalid.' })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
