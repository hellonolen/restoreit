// GET /api/admin/funnel — Funnel stats, leads, customers, abandoned carts (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { funnelEvents, users, scans, payments } from '@/db/schema'
import { sql, gte, eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request.cookies)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const url = new URL(request.url)
  const days = Number(url.searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 86400000)

  const db = await getDb()

  // Funnel event counts
  const eventCounts = await db
    .select({
      event: funnelEvents.event,
      count: sql<number>`count(*)`,
    })
    .from(funnelEvents)
    .where(gte(funnelEvents.createdAt, since))
    .groupBy(funnelEvents.event)

  const funnel: Record<string, number> = {}
  for (const row of eventCounts) {
    funnel[row.event] = row.count
  }

  // Leads: isDemo=true users with at least one scan
  const leadsResult = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      createdAt: users.createdAt,
      scanCount: sql<number>`count(${scans.id})`,
      lastScanAt: sql<number>`max(${scans.startedAt})`,
    })
    .from(users)
    .leftJoin(scans, eq(scans.userId, users.id))
    .where(and(
      eq(users.isDemo, true),
      gte(users.createdAt, since),
    ))
    .groupBy(users.id)
    .orderBy(sql`${users.createdAt} desc`)
    .limit(100)

  const leads = leadsResult.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
    lastScanAt: r.lastScanAt ? Number(r.lastScanAt) : null,
  }))

  // Customers: users with completed payments
  const customersResult = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      createdAt: users.createdAt,
      tier: payments.tier,
      amount: payments.amount,
      paymentDate: payments.createdAt,
    })
    .from(users)
    .innerJoin(payments, and(eq(payments.userId, users.id), eq(payments.status, 'completed')))
    .where(gte(payments.createdAt, since))
    .orderBy(sql`${payments.createdAt} desc`)
    .limit(100)

  const customers = customersResult.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
    paymentDate: r.paymentDate instanceof Date ? r.paymentDate.getTime() : r.paymentDate,
  }))

  // Abandoned carts: checkout_opened without any payment_completed for same user
  const abandonedResult = await db
    .select({
      userId: funnelEvents.userId,
      email: users.email,
      firstName: users.firstName,
      tier: funnelEvents.tier,
      createdAt: funnelEvents.createdAt,
      channel: funnelEvents.channel,
    })
    .from(funnelEvents)
    .innerJoin(users, eq(users.id, funnelEvents.userId))
    .where(and(
      sql`${funnelEvents.event} IN ('checkout_opened', 'partner_checkout_opened')`,
      gte(funnelEvents.createdAt, since),
      sql`${funnelEvents.userId} NOT IN (
        SELECT user_id FROM funnel_events
        WHERE event IN ('payment_completed', 'partner_payment_completed')
      )`,
    ))
    .orderBy(sql`${funnelEvents.createdAt} desc`)
    .limit(100)

  const abandoned = abandonedResult.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
  }))

  return NextResponse.json({
    funnel,
    leads,
    customers,
    abandoned,
    period: { days, since: since.toISOString() },
  })
}
