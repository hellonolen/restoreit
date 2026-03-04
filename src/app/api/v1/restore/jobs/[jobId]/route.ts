// GET /api/v1/restore/jobs/:jobId — Get job status

import { getDb } from '@/db'
import { apiJobs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth'
import type { JobStatusResponse } from '@/lib/api-types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { jobId } = await params
  const db = await getDb()

  const rows = await db
    .select()
    .from(apiJobs)
    .where(and(eq(apiJobs.id, jobId), eq(apiJobs.partnerId, auth.partner.id)))
    .limit(1)

  if (rows.length === 0) {
    return apiError('Job not found', 'not_found', 404)
  }

  const j = rows[0]

  const response: JobStatusResponse = {
    job_id: j.id,
    external_ref: j.externalRef,
    status: j.status as JobStatusResponse['status'],
    files_found: j.filesFound,
    data_restored: j.dataRecovered,
    error: j.error,
    created_at: j.createdAt instanceof Date ? j.createdAt.toISOString() : new Date(j.createdAt as unknown as number).toISOString(),
    completed_at: j.completedAt instanceof Date ? j.completedAt.toISOString() : j.completedAt ? new Date(j.completedAt as unknown as number).toISOString() : null,
  }

  return apiSuccess(response)
}
