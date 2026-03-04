import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { cloudFiles } from '@/db/schema'
import { getSessionUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const db = await getDb()

    const files = await db
      .select({
        id: cloudFiles.id,
        fileName: cloudFiles.fileName,
        fileType: cloudFiles.fileType,
        sizeBytes: cloudFiles.sizeBytes,
        scanId: cloudFiles.scanId,
        expiresAt: cloudFiles.expiresAt,
        createdAt: cloudFiles.createdAt,
      })
      .from(cloudFiles)
      .where(eq(cloudFiles.userId, user.id))
      .orderBy(desc(cloudFiles.createdAt))

    return NextResponse.json({ success: true, data: files })
  } catch (error) {
    console.error('List cloud files error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
