// GET /api/billing — Returns payment history + subscription status from D1

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { payments, subscriptions } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const db = await getDb()

  const [userPayments, userSubscriptions] = await Promise.all([
    db
      .select({
        id: payments.id,
        tier: payments.tier,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt)),
    db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
        cancelledAt: subscriptions.cancelledAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.startedAt)),
  ])

  const activeSubscription = userSubscriptions.find(s => s.status === 'active') ?? null

  return Response.json({
    payments: userPayments,
    subscription: activeSubscription,
  })
}
