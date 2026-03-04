import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users, payments, subscriptions } from '@/db/schema'
import { verifyWebhookSignature } from '@/lib/whop'
import { generateId } from '@/lib/auth'

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
  const tier = (metadata?.tier ?? 'standard') as 'standard' | 'pro'
  const whopPaymentId = data.id as string | undefined
  const amount = (data.amount as number) ?? 0

  if (!userId) {
    console.error('Whop webhook: payment.succeeded missing user_id in metadata')
    return
  }

  // Create payment record
  await db.insert(payments).values({
    id: generateId(),
    userId,
    whopPaymentId: whopPaymentId ?? null,
    tier,
    amount,
    status: 'completed',
    createdAt: new Date(),
  })

  // Upgrade user from demo
  await db
    .update(users)
    .set({ isDemo: false })
    .where(eq(users.id, userId))
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

  await db.insert(subscriptions).values({
    id: generateId(),
    userId,
    whopSubscriptionId: whopSubscriptionId ?? null,
    status: 'active',
    startedAt: new Date(),
  })
}
