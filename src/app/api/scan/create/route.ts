// POST /api/scan/create — Create scan session + issue relay token

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb, schema } from '@/db'
import { trackFunnelEvent } from '@/lib/funnel'

export const runtime = 'edge'

const CHUNK_SIZE_BYTES = 16 * 1024 * 1024 // 16MB

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let driveName: string
  let mode: 'quick' | 'deep'
  try {
    const body = (await request.json()) as { driveName?: string; mode?: string }
    driveName = String(body.driveName || '').trim()
    mode = body.mode === 'deep' ? 'deep' : 'quick'
    if (!driveName) {
      return Response.json({ error: 'driveName is required' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const db = await getDb()
    const scanId = crypto.randomUUID()
    const relayToken = crypto.randomUUID()

    // Hash the relay token for storage — never store plaintext
    const tokenBytes = new TextEncoder().encode(relayToken)
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenBytes)
    const relayTokenHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const now = new Date()

    await db.insert(schema.scans).values({
      id: scanId,
      userId: user.id,
      driveName,
      mode,
      status: 'created',
      filesFound: 0,
      dataSize: 0,
      restoreRate: 0,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      totalChunks: null,
      chunksReceived: 0,
      bytesReceived: 0,
      relayTokenHash,
      startedAt: now,
    })

    await trackFunnelEvent({
      userId: user.id,
      event: 'scan_created',
      scanId,
      metadata: { driveName, mode },
    })

    return Response.json({
      scanId,
      relayToken,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
    })
  } catch (error) {
    console.error('Scan create error:', error)
    return Response.json(
      { error: 'Scan creation failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
