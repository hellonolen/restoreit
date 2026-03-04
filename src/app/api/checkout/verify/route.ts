import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { payments } from '@/db/schema'
import { getSessionUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const db = await getDb()

    // Check for any completed payment in last 10 minutes (covers webhook delay)
    const recentPayments = await db
      .select({
        id: payments.id,
        tier: payments.tier,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt))
      .limit(1)

    if (recentPayments.length === 0) {
      return NextResponse.json({ success: true, verified: false })
    }

    const latest = recentPayments[0]
    const isRecent = Date.now() - new Date(latest.createdAt).getTime() < 10 * 60 * 1000

    return NextResponse.json({
      success: true,
      verified: latest.status === 'completed',
      recent: isRecent,
      tier: latest.tier,
    })
  } catch (error) {
    console.error('Checkout verify error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
