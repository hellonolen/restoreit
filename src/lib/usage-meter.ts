/**
 * Usage metering for RaaS partners.
 * Records events: job_created, gb_scanned, files_restored.
 */

import { getDb } from '@/db'
import { apiUsage } from '@/db/schema'

type UsageEvent = 'job_created' | 'gb_scanned' | 'files_restored'

/**
 * Record a usage event for a partner.
 */
export async function recordUsage(
  partnerId: string,
  event: UsageEvent,
  quantity: number,
  apiJobId?: string
): Promise<void> {
  const db = await getDb()
  await db.insert(apiUsage).values({
    id: crypto.randomUUID(),
    partnerId,
    apiJobId: apiJobId ?? null,
    event,
    quantity,
    recordedAt: new Date(),
  })
}

/**
 * Record GB scanned for a job (called after carving completes).
 */
export async function recordGbScanned(
  partnerId: string,
  apiJobId: string,
  bytesScanned: number
): Promise<void> {
  const gbScanned = bytesScanned / (1024 * 1024 * 1024)
  await recordUsage(partnerId, 'gb_scanned', gbScanned, apiJobId)
}

/**
 * Record files restored for a job (called after restore completes).
 */
export async function recordFilesRestored(
  partnerId: string,
  apiJobId: string,
  fileCount: number
): Promise<void> {
  await recordUsage(partnerId, 'files_restored', fileCount, apiJobId)
}
