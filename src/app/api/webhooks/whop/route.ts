import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users, payments, subscriptions, partners } from '@/db/schema'
import { verifyWebhookSignature, PARTNER_TIERS } from '@/lib/whop'
import { generateId } from '@/lib/auth'
import { trackFunnelEvent } from '@/lib/funnel'
import { generateApiKey, generateWebhookSecret, hashApiKey } from '@/lib/api-auth'

const PARTNER_TIER_SET = new Set<string>(PARTNER_TIERS)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-whop-signature') ?? ''

    // --- Verify webhook signature ---
    const isValid = await verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error('Whop webhook: invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const eventType = event.event ?? event.type

    const db = await getDb()

    switch (eventType) {
      case 'payment.succeeded': {
        await handlePaymentSucceeded(db, event)
        break
      }
      case 'subscription.created': {
        await handleSubscriptionCreated(db, event)
        break
      }
      default: {
        console.log(`Whop webhook: unhandled event type "${eventType}"`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Whop webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(
  db: Awaited<ReturnType<typeof getDb>>,
  event: Record<string, unknown>
) {
  const data = event.data as Record<string, unknown> | undefined
  if (!data) {
    console.error('Whop webhook: payment.succeeded missing data')
    return
  }

  const metadata = data.metadata as Record<string, string> | undefined
  const userId = metadata?.user_id
  const tier = (metadata?.tier ?? 'scan') as 'scan' | 'pro' | 'cloud' | 'protection' | 'starter' | 'growth' | 'enterprise'
  const checkoutType = metadata?.checkout_type ?? 'consumer'
  const scanId = metadata?.scan_id ?? null
  const whopPaymentId = data.id as string | undefined
  const amount = (data.amount as number) ?? 0

  if (!userId) {
    console.error('Whop webhook: payment.succeeded missing user_id in metadata')
    return
  }

  // Idempotency: skip if we already processed this payment
  if (whopPaymentId) {
    const existing = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.whopPaymentId, whopPaymentId))
      .limit(1)
    if (existing.length > 0) {
      console.log(`Whop webhook: payment ${whopPaymentId} already processed, skipping`)
      return
    }
  }

  // Verify userId exists
  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (userRows.length === 0) {
    console.error(`Whop webhook: user ${userId} not found`)
    return
  }

  // Create payment record
  await db.insert(payments).values({
    id: generateId(),
    userId,
    whopPaymentId: whopPaymentId ?? null,
    scanId,
    tier,
    amount,
    status: 'completed',
    createdAt: new Date(),
  })

  // Track funnel event
  const paymentEvent = PARTNER_TIER_SET.has(tier) ? 'partner_payment_completed' : 'payment_completed' as const
  await trackFunnelEvent({
    userId,
    event: paymentEvent,
    scanId,
    tier,
    channel: checkoutType as 'consumer' | 'partner',
    metadata: { amount, whopPaymentId },
  })

  // Upgrade user from demo
  await db
    .update(users)
    .set({ isDemo: false })
    .where(eq(users.id, userId))

  // If this is a partner tier payment, update the partner record
  if (checkoutType === 'partner' && PARTNER_TIER_SET.has(tier)) {
    const partnerTier = tier as 'starter' | 'growth' | 'enterprise'
    const locations = Number(metadata?.locations) || 1

    // Rate limits per tier
    const rateLimits: Record<string, number> = {
      starter: 100,
      growth: 500,
      enterprise: 10000,
    }

    // GB limits per tier (null = unlimited)
    const gbLimits: Record<string, number | null> = {
      starter: 100,
      growth: 1000,
      enterprise: null,
    }

    const partnerRows = await db
      .select({ id: partners.id })
      .from(partners)
      .where(eq(partners.userId, userId))
      .limit(1)

    if (partnerRows.length > 0) {
      // Upgrade existing partner
      await db
        .update(partners)
        .set({
          tier: partnerTier,
          rateLimit: rateLimits[partnerTier] ?? 100,
          monthlyGbLimit: gbLimits[partnerTier],
        })
        .where(eq(partners.userId, userId))
      console.log(`Whop webhook: upgraded partner ${partnerRows[0].id} to ${partnerTier} (${locations} locations)`)
    } else {
      // Auto-create partner record with the paid tier
      // User will see their credentials on the dashboard (one-time display)
      const userRow = await db
        .select({ email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      const apiKey = generateApiKey()
      const webhookSecret = generateWebhookSecret()
      const keyHash = await hashApiKey(apiKey)
      const partnerId = generateId()

      await db.insert(partners).values({
        id: partnerId,
        userId,
        name: userRow[0]?.firstName ?? 'Partner',
        email: userRow[0]?.email ?? '',
        apiKeyHash: keyHash,
        webhookSecret,
        tier: partnerTier,
        rateLimit: rateLimits[partnerTier] ?? 100,
        monthlyGbLimit: gbLimits[partnerTier],
        createdAt: new Date(),
      })
      console.log(`Whop webhook: auto-created partner ${partnerId} at ${partnerTier} tier for user ${userId}`)
    }
  }
}

async function handleSubscriptionCreated(
  db: Awaited<ReturnType<typeof getDb>>,
  event: Record<string, unknown>
) {
  const data = event.data as Record<string, unknown> | undefined
  if (!data) {
    console.error('Whop webhook: subscription.created missing data')
    return
  }

  const metadata = data.metadata as Record<string, string> | undefined
  const userId = metadata?.user_id
  const whopSubscriptionId = data.id as string | undefined

  if (!userId) {
    console.error('Whop webhook: subscription.created missing user_id in metadata')
    return
  }

  // Idempotency: skip if we already processed this subscription
  if (whopSubscriptionId) {
    const existing = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.whopSubscriptionId, whopSubscriptionId))
      .limit(1)
    if (existing.length > 0) {
      console.log(`Whop webhook: subscription ${whopSubscriptionId} already processed, skipping`)
      return
    }
  }

  // Verify userId exists
  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (userRows.length === 0) {
    console.error(`Whop webhook: user ${userId} not found`)
    return
  }

  await db.insert(subscriptions).values({
    id: generateId(),
    userId,
    whopSubscriptionId: whopSubscriptionId ?? null,
    status: 'active',
    startedAt: new Date(),
  })
}
