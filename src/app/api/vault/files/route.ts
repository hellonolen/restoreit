import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { vaultFiles } from '@/db/schema'
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
        id: vaultFiles.id,
        fileName: vaultFiles.fileName,
        fileType: vaultFiles.fileType,
        sizeBytes: vaultFiles.sizeBytes,
        scanId: vaultFiles.scanId,
        expiresAt: vaultFiles.expiresAt,
        createdAt: vaultFiles.createdAt,
      })
      .from(vaultFiles)
      .where(eq(vaultFiles.userId, user.id))
      .orderBy(desc(vaultFiles.createdAt))

    return NextResponse.json({ success: true, data: files })
  } catch (error) {
    console.error('List vault files error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
