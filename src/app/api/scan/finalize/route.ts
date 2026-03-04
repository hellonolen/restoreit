// POST /api/scan/finalize — Write manifest, enqueue carve job

import { getDb, schema } from '@/db'
import { eq, and } from 'drizzle-orm'

export const runtime = 'edge'

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

  let scanId: string
  let totalChunks: number | undefined
  let chunkHashes: string[] | undefined
  try {
    const body = (await request.json()) as {
      scanId?: string
      totalChunks?: number
      chunkHashes?: string[]
    }
    scanId = String(body.scanId || '').trim()
    totalChunks = body.totalChunks
    chunkHashes = body.chunkHashes
    if (!scanId) {
      return Response.json({ error: 'scanId is required' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Verify relay token
  const db = await getDb()
  const tokenHash = await hashToken(relayToken)

  const scan = await db.query.scans.findFirst({
    where: and(eq(schema.scans.id, scanId), eq(schema.scans.relayTokenHash, tokenHash)),
  })

  if (!scan) {
    return Response.json({ error: 'Invalid scan ID or relay token' }, { status: 403 })
  }

  if (scan.status !== 'uploading' && scan.status !== 'created') {
    return Response.json({ error: `Cannot finalize scan in status: ${scan.status}` }, { status: 409 })
  }

  // Build manifest
  const manifest = {
    scanId,
    chunkSizeBytes: scan.chunkSizeBytes,
    totalChunks: totalChunks ?? scan.chunksReceived,
    totalBytes: scan.bytesReceived,
    chunksReceived: scan.chunksReceived,
    chunkHashes: chunkHashes ?? [],
    finalizedAt: new Date().toISOString(),
  }

  // Write manifest to R2
  const r2 = await getR2Bucket()
  await r2.put(`manifests/${scanId}.json`, JSON.stringify(manifest, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })

  // Update scan status
  const now = new Date()
  await db
    .update(schema.scans)
    .set({
      status: 'finalized',
      totalChunks: manifest.totalChunks,
    })
    .where(eq(schema.scans.id, scanId))

  // Create carve job
  const jobId = crypto.randomUUID()
  await db.insert(schema.carveJobs).values({
    id: jobId,
    scanId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  })

  return Response.json({
    success: true,
    scanId,
    jobId,
    manifest: {
      totalChunks: manifest.totalChunks,
      totalBytes: manifest.totalBytes,
    },
  })
}
