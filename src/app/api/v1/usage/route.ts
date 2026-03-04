// GET /api/v1/usage — Get partner's usage summary for current billing period

import { getDb } from '@/db'
import { apiUsage } from '@/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { authenticateApiKey, apiSuccess } from '@/lib/api-auth'
import type { UsageSummary } from '@/lib/api-types'

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { partner } = auth

  // Current billing period: start of current month
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const db = await getDb()

  // Aggregate usage by event type
  const usageRows = await db
    .select({
      event: apiUsage.event,
      total: sql<number>`SUM(${apiUsage.quantity})`.as('total'),
    })
    .from(apiUsage)
    .where(
      and(
        eq(apiUsage.partnerId, partner.id),
        gte(apiUsage.recordedAt, periodStart)
      )
    )
    .groupBy(apiUsage.event)

  const usageMap = new Map(usageRows.map(r => [r.event, r.total ?? 0]))

  const gbScanned = usageMap.get('gb_scanned') ?? 0
  const gbRemaining = partner.monthlyGbLimit !== null
    ? Math.max(0, partner.monthlyGbLimit - gbScanned)
    : null

  const response: UsageSummary = {
    partner_id: partner.id,
    tier: partner.tier,
    period,
    jobs_created: usageMap.get('job_created') ?? 0,
    gb_scanned: gbScanned,
    files_restored: usageMap.get('files_restored') ?? 0,
    rate_limit: partner.rateLimit,
    monthly_gb_limit: partner.monthlyGbLimit,
    gb_remaining: gbRemaining,
  }

  return apiSuccess(response)
}
