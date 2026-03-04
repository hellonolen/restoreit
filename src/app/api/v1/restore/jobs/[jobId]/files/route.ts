// GET /api/v1/restore/jobs/:jobId/files — List restored files for a job

import { getDb } from '@/db'
import { apiJobs, cloudFiles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth'
import type { JobFilesResponse, RestoredFile } from '@/lib/api-types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { jobId } = await params
  const db = await getDb()

  // Verify job belongs to partner
  const jobRows = await db
    .select({ scanId: apiJobs.scanId, status: apiJobs.status })
    .from(apiJobs)
    .where(and(eq(apiJobs.id, jobId), eq(apiJobs.partnerId, auth.partner.id)))
    .limit(1)

  if (jobRows.length === 0) {
    return apiError('Job not found', 'not_found', 404)
  }

  const job = jobRows[0]

  if (!job.scanId) {
    return apiSuccess({ job_id: jobId, files: [], total: 0 } satisfies JobFilesResponse)
  }

  // Get cloud files linked to this scan
  const files = await db
    .select({
      id: cloudFiles.id,
      fileName: cloudFiles.fileName,
      fileType: cloudFiles.fileType,
      sizeBytes: cloudFiles.sizeBytes,
      confidence: cloudFiles.confidence,
      integrity: cloudFiles.integrity,
      sha256: cloudFiles.sha256,
    })
    .from(cloudFiles)
    .where(eq(cloudFiles.scanId, job.scanId))

  const formatted: RestoredFile[] = files.map(f => ({
    file_id: f.id,
    file_name: f.fileName,
    file_type: f.fileType,
    size_bytes: f.sizeBytes,
    confidence: f.confidence,
    integrity: f.integrity as RestoredFile['integrity'],
    sha256: f.sha256,
    download_url: `/api/v1/restore/jobs/${jobId}/files/${f.id}/download`,
  }))

  return apiSuccess({
    job_id: jobId,
    files: formatted,
    total: formatted.length,
  } satisfies JobFilesResponse)
}
