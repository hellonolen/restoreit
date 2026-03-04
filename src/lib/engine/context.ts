// Find and RestoreIt Engine — Context Manager

import type { EngineContext, ConversationMessage, ScanState } from './types'
import { getDb } from '../../db'
import { schema } from '../../db'
import { eq, desc, and, notInArray } from 'drizzle-orm'

// Map DB scan status to ScanState status
function mapScanStatus(dbStatus: string): ScanState['status'] {
  switch (dbStatus) {
    case 'created':
    case 'uploading':
      return 'scanning'
    case 'finalized':
    case 'carving':
      return 'scanning'
    case 'ready':
      return 'completed'
    case 'failed':
    case 'cancelled':
      return 'failed'
    default:
      return 'idle'
  }
}

export async function buildContext(
  userId: string,
  conversationHistory: ConversationMessage[] = []
): Promise<EngineContext> {
  const db = await getDb()

  // Load user profile
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  })

  // Load most recent active scan (uploading or carving)
  const activeScan = await db.query.scans.findFirst({
    where: and(
      eq(schema.scans.userId, userId),
      notInArray(schema.scans.status, ['ready', 'failed', 'cancelled']),
    ),
    orderBy: [desc(schema.scans.startedAt)],
  })

  // Fall back to most recent scan of any status
  const recentScan = activeScan ?? await db.query.scans.findFirst({
    where: eq(schema.scans.userId, userId),
    orderBy: [desc(schema.scans.startedAt)],
  })

  let scanState: ScanState | undefined
  if (recentScan) {
    const progress = recentScan.totalChunks && recentScan.totalChunks > 0
      ? Math.floor((recentScan.chunksReceived / recentScan.totalChunks) * 100)
      : 0

    scanState = {
      id: recentScan.id,
      status: mapScanStatus(recentScan.status),
      progress,
      filesFound: recentScan.filesFound,
      dataSize: recentScan.dataSize,
      sectorsScanned: recentScan.chunksReceived,
      totalSectors: recentScan.totalChunks ?? 0,
      driveName: recentScan.driveName,
      mode: recentScan.mode,
    }
  }

  return {
    userId,
    scanId: recentScan?.id,
    conversationHistory,
    scanState,
    userProfile: user ? {
      email: user.email,
      firstName: user.firstName,
      isDemo: user.isDemo,
    } : undefined,
  }
}
