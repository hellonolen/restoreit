import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getDb } from '@/db'
import { vaultFiles } from '@/db/schema'
import { getSessionUser } from '@/lib/auth'
import { generateDownloadUrl } from '@/lib/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { fileId } = await params

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    const db = await getDb()

    const fileRows = await db
      .select()
      .from(vaultFiles)
      .where(
        and(
          eq(vaultFiles.id, fileId),
          eq(vaultFiles.userId, user.id)
        )
      )
      .limit(1)

    if (fileRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const file = fileRows[0]

    // Check if file has expired
    if (file.expiresAt && file.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This file has expired' },
        { status: 410 }
      )
    }

    const url = await generateDownloadUrl(file.r2Key)

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Download URL error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
