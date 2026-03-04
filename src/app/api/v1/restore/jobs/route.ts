// POST /api/v1/restore/jobs — Submit a restore job
// GET  /api/v1/restore/jobs — List partner's jobs

import { getDb } from '@/db'
import { apiJobs, scans, apiUsage } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth'
import type { CreateJobRequest, CreateJobResponse, JobStatusResponse } from '@/lib/api-types'

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { partner } = auth

  let body: CreateJobRequest
  try {
    body = await request.json() as CreateJobRequest
  } catch {
    return apiError('Invalid JSON body', 'invalid_body', 400)
  }

  // Validate: must provide either image_url or r2_key
  if (!body.image_url && !body.r2_key) {
    return apiError('Either image_url or r2_key is required', 'missing_source', 400)
  }

  const scanMode = body.scan_mode ?? 'deep'
  if (scanMode !== 'quick' && scanMode !== 'deep') {
    return apiError('scan_mode must be "quick" or "deep"', 'invalid_scan_mode', 400)
  }

  if (body.file_types && !Array.isArray(body.file_types)) {
    return apiError('file_types must be an array of strings', 'invalid_file_types', 400)
  }

  if (body.callback_url) {
    try {
      new URL(body.callback_url)
    } catch {
      return apiError('callback_url must be a valid URL', 'invalid_callback_url', 400)
    }
  }

  const db = await getDb()
  const jobId = `rj_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  const now = new Date()

  await db.insert(apiJobs).values({
    id: jobId,
    partnerId: partner.id,
    externalRef: body.external_ref ?? null,
    imageUrl: body.image_url ?? null,
    scanMode,
    fileTypes: body.file_types ? JSON.stringify(body.file_types) : null,
    status: 'queued',
    callbackUrl: body.callback_url ?? null,
    scanId: null,
    createdAt: now,
  })

  // Record usage event
  await db.insert(apiUsage).values({
    id: crypto.randomUUID(),
    partnerId: partner.id,
    apiJobId: jobId,
    event: 'job_created',
    quantity: 1,
    recordedAt: now,
  })

  const response: CreateJobResponse = {
    job_id: jobId,
    status: 'queued',
    estimated_wait: scanMode === 'quick' ? '1-3 minutes' : '2-10 minutes',
    poll_url: `/api/v1/restore/jobs/${jobId}`,
  }

  return apiSuccess(response, 202)
}

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const { partner } = auth
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const db = await getDb()

  const jobs = await db
    .select({
      id: apiJobs.id,
      externalRef: apiJobs.externalRef,
      status: apiJobs.status,
      filesFound: apiJobs.filesFound,
      dataRecovered: apiJobs.dataRecovered,
      error: apiJobs.error,
      createdAt: apiJobs.createdAt,
      completedAt: apiJobs.completedAt,
    })
    .from(apiJobs)
    .where(eq(apiJobs.partnerId, partner.id))
    .orderBy(desc(apiJobs.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted: JobStatusResponse[] = jobs.map(j => ({
    job_id: j.id,
    external_ref: j.externalRef,
    status: j.status as JobStatusResponse['status'],
    files_found: j.filesFound,
    data_restored: j.dataRecovered,
    error: j.error,
    created_at: j.createdAt instanceof Date ? j.createdAt.toISOString() : new Date(j.createdAt as unknown as number).toISOString(),
    completed_at: j.completedAt instanceof Date ? j.completedAt.toISOString() : j.completedAt ? new Date(j.completedAt as unknown as number).toISOString() : null,
  }))

  return apiSuccess({ jobs: formatted, total: formatted.length, limit, offset })
}
