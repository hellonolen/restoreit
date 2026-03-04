// POST /api/ingest — Receive raw binary chunks → R2

import { getDb, schema } from '@/db'
import { eq, and } from 'drizzle-orm'


const MAX_CHUNK_SIZE = 16 * 1024 * 1024 // 16MB

async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token)
  const buffer = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getR2Bucket(): Promise<R2Bucket> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  return (env as Record<string, unknown>).VAULT as R2Bucket
}

export async function POST(request: Request) {
  // Auth: Bearer relay token
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Missing relay token' }, { status: 401 })
  }
  const relayToken = authHeader.slice(7)

  // Required headers
  const scanId = request.headers.get('X-Scan-Id')
  const chunkIndexStr = request.headers.get('X-Chunk-Index')
  const chunkSha256 = request.headers.get('X-Chunk-Sha256')

  if (!scanId || !chunkIndexStr) {
    return Response.json({ error: 'X-Scan-Id and X-Chunk-Index headers are required' }, { status: 400 })
  }

  const chunkIndex = parseInt(chunkIndexStr, 10)
  if (isNaN(chunkIndex) || chunkIndex < 0) {
    return Response.json({ error: 'Invalid chunk index' }, { status: 400 })
  }

  // Verify relay token against scan record
  const db = await getDb()
  const tokenHash = await hashToken(relayToken)

  const scan = await db.query.scans.findFirst({
    where: and(eq(schema.scans.id, scanId), eq(schema.scans.relayTokenHash, tokenHash)),
  })

  if (!scan) {
    return Response.json({ error: 'Invalid scan ID or relay token' }, { status: 403 })
  }

  if (scan.status === 'failed' || scan.status === 'cancelled') {
    return Response.json({ error: `Scan is ${scan.status}` }, { status: 409 })
  }

  // Read raw binary body
  const body = await request.arrayBuffer()
  const chunkSize = body.byteLength

  if (chunkSize === 0) {
    return Response.json({ error: 'Empty chunk' }, { status: 400 })
  }

  if (chunkSize > MAX_CHUNK_SIZE) {
    return Response.json({ error: `Chunk exceeds max size of ${MAX_CHUNK_SIZE} bytes` }, { status: 413 })
  }

  // Verify SHA-256 if provided
  if (chunkSha256) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', body)
    const computedHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (computedHash !== chunkSha256.toLowerCase()) {
      return Response.json({ error: 'SHA-256 mismatch' }, { status: 422 })
    }
  }

  // Write to R2
  const r2Key = `raw/${scanId}/chunk-${chunkIndex}.bin`
  const r2 = await getR2Bucket()
  await r2.put(r2Key, body)

  // Update D1 progress
  await db
    .update(schema.scans)
    .set({
      chunksReceived: scan.chunksReceived + 1,
      bytesReceived: scan.bytesReceived + chunkSize,
      status: scan.status === 'created' ? 'uploading' : scan.status,
    })
    .where(eq(schema.scans.id, scanId))

  return Response.json({
    success: true,
    chunkIndex,
    bytesReceived: chunkSize,
  })
}
