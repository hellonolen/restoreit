// GET /api/partner/dashboard — KPI data for the partner dashboard (session auth)

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb } from '@/db'
import { partners, apiJobs, apiUsage, webhookLogs } from '@/db/schema'
import { eq, and, sql, desc, gte } from 'drizzle-orm'
import { TIER_MONTHLY_PRICE } from '@/lib/partner-constants'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  if (!user) {
    return json({ error: 'Authentication required' }, 401)
  }

  const db = await getDb()

  // Find partner record for this user
  const partnerRows = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1)

  if (partnerRows.length === 0) {
    return json({ registered: false })
  }

  const partner = partnerRows[0]

  // Job counts by status
  const jobStats = await db
    .select({
      status: apiJobs.status,
      count: sql<number>`count(*)`,
    })
    .from(apiJobs)
    .where(eq(apiJobs.partnerId, partner.id))
    .groupBy(apiJobs.status)

  const statusCounts: Record<string, number> = {}
  for (const row of jobStats) {
    statusCounts[row.status] = row.count
  }
  const totalJobs = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // Average completion time for completed jobs
  const avgTimeRows = await db
    .select({
      avgMs: sql<number>`avg(completed_at - created_at)`,
    })
    .from(apiJobs)
    .where(and(
      eq(apiJobs.partnerId, partner.id),
      eq(apiJobs.status, 'completed'),
    ))

  const avgCompletionMs = avgTimeRows[0]?.avgMs ?? 0

  // Monthly usage (current month)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const usageRows = await db
    .select({
      event: apiUsage.event,
      total: sql<number>`sum(quantity)`,
    })
    .from(apiUsage)
    .where(and(
      eq(apiUsage.partnerId, partner.id),
      gte(apiUsage.recordedAt, monthStart),
    ))
    .groupBy(apiUsage.event)

  const usageMap: Record<string, number> = {}
  for (const row of usageRows) {
    usageMap[row.event] = row.total
  }

  const gbScanned = usageMap['gb_scanned'] ?? 0
  const filesRestored = usageMap['files_restored'] ?? 0
  const monthlyPrice = TIER_MONTHLY_PRICE[partner.tier] ?? 149

  // Recent 10 jobs
  const recentJobs = await db
    .select({
      id: apiJobs.id,
      externalRef: apiJobs.externalRef,
      status: apiJobs.status,
      filesFound: apiJobs.filesFound,
      dataRecovered: apiJobs.dataRecovered,
      createdAt: apiJobs.createdAt,
      completedAt: apiJobs.completedAt,
    })
    .from(apiJobs)
    .where(eq(apiJobs.partnerId, partner.id))
    .orderBy(desc(apiJobs.createdAt))
    .limit(10)

  // Recent webhook deliveries (10 most recent)
  const recentWebhooks = await db
    .select({
      id: webhookLogs.id,
      event: webhookLogs.event,
      callbackUrl: webhookLogs.callbackUrl,
      statusCode: webhookLogs.statusCode,
      success: webhookLogs.success,
      attempts: webhookLogs.attempts,
      errorMessage: webhookLogs.errorMessage,
      deliveredAt: webhookLogs.deliveredAt,
    })
    .from(webhookLogs)
    .where(eq(webhookLogs.partnerId, partner.id))
    .orderBy(desc(webhookLogs.deliveredAt))
    .limit(10)

  return json({
    registered: true,
    partner: {
      name: partner.name,
      tier: partner.tier,
      apiKeyHint: `ri_...${partner.apiKeyHash.slice(-6)}`,
    },
    kpis: {
      totalJobs,
      completed: statusCounts['completed'] ?? 0,
      inProgress: (statusCounts['queued'] ?? 0) + (statusCounts['downloading'] ?? 0) + (statusCounts['processing'] ?? 0),
      failed: statusCounts['failed'] ?? 0,
      avgCompletionMs: Math.round(avgCompletionMs),
      gbScanned: Math.round(gbScanned * 100) / 100,
      filesRestored: Math.round(filesRestored),
      monthlyPrice,
    },
    recentJobs: recentJobs.map(j => ({
      ...j,
      createdAt: j.createdAt instanceof Date ? j.createdAt.getTime() : j.createdAt,
      completedAt: j.completedAt instanceof Date ? j.completedAt.getTime() : j.completedAt,
    })),
    recentWebhooks: recentWebhooks.map(w => ({
      ...w,
      deliveredAt: w.deliveredAt instanceof Date ? w.deliveredAt.getTime() : w.deliveredAt,
    })),
  })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
