// GET /api/v1/restore/jobs/:jobId/files/:fileId/download — Stream file from R2

import { getDb } from '@/db'
import { apiJobs, cloudFiles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticateApiKey, apiError } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string; fileId: string }> }
) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { jobId, fileId } = await params
  const db = await getDb()

  // Verify job belongs to partner
  const jobRows = await db
    .select({ scanId: apiJobs.scanId })
    .from(apiJobs)
    .where(and(eq(apiJobs.id, jobId), eq(apiJobs.partnerId, auth.partner.id)))
    .limit(1)

  if (jobRows.length === 0 || !jobRows[0].scanId) {
    return apiError('Job not found', 'not_found', 404)
  }

  // Get file and verify it belongs to this scan
  const fileRows = await db
    .select({
      r2Key: cloudFiles.r2Key,
      fileName: cloudFiles.fileName,
      fileType: cloudFiles.fileType,
      sizeBytes: cloudFiles.sizeBytes,
    })
    .from(cloudFiles)
    .where(and(eq(cloudFiles.id, fileId), eq(cloudFiles.scanId, jobRows[0].scanId)))
    .limit(1)

  if (fileRows.length === 0) {
    return apiError('File not found', 'not_found', 404)
  }

  const file = fileRows[0]

  // Stream directly from R2 using the binding
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  const r2 = (env as Record<string, unknown>).VAULT as R2Bucket

  const object = await r2.get(file.r2Key)
  if (!object) {
    return apiError('File not found in storage', 'storage_error', 404)
  }

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream'

  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
      'Content-Length': String(file.sizeBytes),
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
