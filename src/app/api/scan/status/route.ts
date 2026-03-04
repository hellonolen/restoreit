// GET /api/scan/status — Return real scan progress

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb, schema } from '@/db'
import { eq, and, sql } from 'drizzle-orm'


export async function GET(request: Request) {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const url = new URL(request.url)
  const scanId = url.searchParams.get('scan')

  if (!scanId) {
    return Response.json({ error: 'scan parameter is required' }, { status: 400 })
  }

  const db = await getDb()

  const scan = await db.query.scans.findFirst({
    where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, user.id)),
  })

  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  // Count cloud files for this scan
  const cloudCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.cloudFiles)
    .where(eq(schema.cloudFiles.scanId, scanId))

  const filesFound = cloudCount[0]?.count ?? 0

  return Response.json({
    scanId: scan.id,
    status: scan.status,
    driveName: scan.driveName,
    mode: scan.mode,
    chunkSizeBytes: scan.chunkSizeBytes,
    totalChunks: scan.totalChunks,
    chunksReceived: scan.chunksReceived,
    bytesReceived: scan.bytesReceived,
    filesFound,
  })
}
