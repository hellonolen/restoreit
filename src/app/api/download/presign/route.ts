// POST /api/download/presign — Presigned R2 download URLs

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { getDb, schema } from '@/db'
import { eq, and } from 'drizzle-orm'
import { generateDownloadUrl } from '@/lib/r2'


export async function POST(request: Request) {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let fileId: string
  try {
    const body = (await request.json()) as { fileId?: string }
    fileId = String(body.fileId || '').trim()
    if (!fileId) {
      return Response.json({ error: 'fileId is required' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const db = await getDb()

  // Paywall: check for completed payment
  const payment = await db.query.payments.findFirst({
    where: and(eq(schema.payments.userId, user.id), eq(schema.payments.status, 'completed')),
  })

  if (!payment) {
    return Response.json(
      { error: 'Payment required', requiresPayment: true },
      { status: 402 }
    )
  }

  // Find cloud file
  const file = await db.query.cloudFiles.findFirst({
    where: and(eq(schema.cloudFiles.id, fileId), eq(schema.cloudFiles.userId, user.id)),
  })

  if (!file) {
    return Response.json({ error: 'File not found' }, { status: 404 })
  }

  // Generate presigned URL (1 hour expiry)
  const url = await generateDownloadUrl(file.r2Key, 3600)

  return Response.json({
    fileId: file.id,
    fileName: file.fileName,
    fileType: file.fileType,
    sizeBytes: file.sizeBytes,
    integrity: file.integrity,
    url,
    expiresIn: 3600,
  })
}
