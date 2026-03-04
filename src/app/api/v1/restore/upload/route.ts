// PUT /api/v1/restore/upload — Upload disk image chunks directly to R2
// Partners upload their disk image here, get back an r2_key to use with job submission.

import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth'

const MAX_CHUNK_SIZE = 100 * 1024 * 1024 // 100MB per upload

export async function PUT(request: Request) {
  const auth = await authenticateApiKey(request)
  if ('error' in auth) return auth.error

  const contentLength = parseInt(request.headers.get('content-length') ?? '0')
  if (contentLength > MAX_CHUNK_SIZE) {
    return apiError(`Upload too large. Max ${MAX_CHUNK_SIZE / 1024 / 1024}MB per request.`, 'payload_too_large', 413)
  }

  const uploadId = request.headers.get('x-upload-id') ?? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const chunkIndex = parseInt(request.headers.get('x-chunk-index') ?? '0')

  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  const cfEnv = env as Record<string, unknown>
  const r2 = cfEnv.VAULT as R2Bucket

  const body = await request.arrayBuffer()
  const r2Key = `api-uploads/${auth.partner.id}/${uploadId}/chunk-${String(chunkIndex).padStart(3, '0')}.bin`

  await r2.put(r2Key, body, {
    httpMetadata: { contentType: 'application/octet-stream' },
  })

  return apiSuccess({
    upload_id: uploadId,
    chunk_index: chunkIndex,
    r2_key: r2Key,
    size: body.byteLength,
  })
}
