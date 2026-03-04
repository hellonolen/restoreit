import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { getDb } from '@/db'
import { scans } from '@/db/schema'
import { getSessionUser, generateId } from '@/lib/auth'

const VALID_MODES = ['quick', 'deep'] as const

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

    const userScans = await db
      .select({
        id: scans.id,
        userId: scans.userId,
        driveName: scans.driveName,
        mode: scans.mode,
        status: scans.status,
        filesFound: scans.filesFound,
        dataSize: scans.dataSize,
        restoreRate: scans.restoreRate,
        startedAt: scans.startedAt,
        completedAt: scans.completedAt,
      })
      .from(scans)
      .where(eq(scans.userId, user.id))
      .orderBy(desc(scans.startedAt))

    return NextResponse.json({ success: true, data: userScans })
  } catch (error) {
    console.error('List scans error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { driveName: string; mode: 'quick' | 'deep' }
    const { driveName, mode } = body

    if (!driveName || !mode) {
      return NextResponse.json(
        { success: false, error: 'driveName and mode are required' },
        { status: 400 }
      )
    }

    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json(
        { success: false, error: `mode must be one of: ${VALID_MODES.join(', ')}` },
        { status: 400 }
      )
    }

    const db = await getDb()
    const scanId = generateId()
    const now = new Date()

    await db.insert(scans).values({
      id: scanId,
      userId: user.id,
      driveName: driveName.trim(),
      mode,
      status: 'created',
      filesFound: 0,
      dataSize: 0,
      restoreRate: 0,
      startedAt: now,
    })

    const newScan = await db
      .select()
      .from(scans)
      .where(eq(scans.id, scanId))
      .limit(1)

    return NextResponse.json(
      { success: true, data: newScan[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create scan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
