// Find and restoreit Engine — Real Tool Definitions

import type { Tool, ToolResult, EngineContext } from './types'
import { getDb } from '../../db'
import { schema } from '../../db'
import { eq, and, sql } from 'drizzle-orm'
import { generateDownloadUrl } from '../r2'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://restoreit.app'

function generateId(): string {
  return crypto.randomUUID()
}

async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token)
  const buffer = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── scan_drive ───────────────────────────────────────────
export const scanDrive: Tool = {
  name: 'scan_drive',
  description: 'Start a drive scan. Creates a scan session and returns the relay command the user must run in Terminal to upload their drive data.',
  parameters: {
    type: 'object',
    properties: {
      drive_name: { type: 'string', description: 'Name or path of the drive to scan (e.g. "Macintosh HD", "/dev/disk2")' },
      mode: { type: 'string', description: 'Scan mode', enum: ['quick', 'deep'] },
    },
    required: ['drive_name', 'mode'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const driveName = String(params.drive_name)
    const mode = String(params.mode) as 'quick' | 'deep'

    const db = await getDb()
    const scanId = generateId()
    const relayToken = generateId()
    const relayTokenHash = await hashToken(relayToken)
    const now = new Date()

    await db.insert(schema.scans).values({
      id: scanId,
      userId: ctx.userId,
      driveName,
      mode,
      status: 'created',
      filesFound: 0,
      dataSize: 0,
      restoreRate: 0,
      chunkSizeBytes: 16777216,
      totalChunks: null,
      chunksReceived: 0,
      bytesReceived: 0,
      relayTokenHash,
      startedAt: now,
    })

    const relayCommand = `RESTOREIT_TOKEN=${relayToken} bash <(curl -sL "${APP_URL}/api/relay?scan=${scanId}") ${driveName}`

    return {
      success: true,
      data: {
        scanId,
        driveName,
        mode,
        status: 'created',
        relayCommand,
      },
      message: `Scan session created for ${driveName} (${mode} mode).\n\nRun this command in Terminal to start uploading:\n\n\`\`\`\n${relayCommand}\n\`\`\`\n\nThe relay script will read your drive in read-only mode and securely upload the data to our cloud. It will ask for confirmation before starting.`,
    }
  },
}

// ─── get_scan_status ──────────────────────────────────────
export const getScanStatus: Tool = {
  name: 'get_scan_status',
  description: 'Check the current progress of a scan — upload progress, carving status, files found.',
  parameters: {
    type: 'object',
    properties: {
      scan_id: { type: 'string', description: 'The scan ID to check status for' },
    },
    required: ['scan_id'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const scanId = String(params.scan_id)
    const db = await getDb()

    const scan = await db.query.scans.findFirst({
      where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, ctx.userId)),
    })

    if (!scan) {
      return { success: false, data: null, message: 'Scan not found or access denied.' }
    }

    // Count cloud files
    const cloudCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.cloudFiles)
      .where(eq(schema.cloudFiles.scanId, scanId))

    const filesFound = cloudCount[0]?.count ?? 0
    const uploadProgress = scan.totalChunks && scan.totalChunks > 0
      ? Math.floor((scan.chunksReceived / scan.totalChunks) * 100)
      : scan.chunksReceived > 0 ? -1 : 0 // -1 = uploading but total unknown

    // Check carve job status if applicable
    let carveStatus: string | null = null
    if (['finalized', 'carving', 'ready'].includes(scan.status)) {
      const job = await db.query.carveJobs.findFirst({
        where: eq(schema.carveJobs.scanId, scanId),
      })
      if (job) {
        carveStatus = job.status
      }
    }

    const statusMessages: Record<string, string> = {
      created: 'Scan created. Waiting for relay upload to begin.',
      uploading: `Uploading: ${scan.chunksReceived} chunks received (${formatBytes(scan.bytesReceived)}).`,
      finalized: 'Upload complete. Waiting for carving to begin.',
      carving: `Carving in progress. ${filesFound} files detected so far.`,
      ready: `Scan complete. ${filesFound} files recovered and ready for download.`,
      failed: 'Scan failed. Check the relay output for details.',
      cancelled: 'Scan was cancelled.',
    }

    return {
      success: true,
      data: {
        scanId,
        status: scan.status,
        driveName: scan.driveName,
        mode: scan.mode,
        chunksReceived: scan.chunksReceived,
        totalChunks: scan.totalChunks,
        bytesReceived: scan.bytesReceived,
        uploadProgress,
        filesFound,
        carveStatus,
      },
      message: statusMessages[scan.status] || `Status: ${scan.status}`,
    }
  },
}

// ─── analyze_results ──────────────────────────────────────
export const analyzeResults: Tool = {
  name: 'analyze_results',
  description: 'Analyze the results of a completed scan. Returns file breakdown by type and integrity assessment from cloud storage data.',
  parameters: {
    type: 'object',
    properties: {
      scan_id: { type: 'string', description: 'The scan ID to analyze' },
    },
    required: ['scan_id'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const scanId = String(params.scan_id)
    const db = await getDb()

    const scan = await db.query.scans.findFirst({
      where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, ctx.userId)),
    })

    if (!scan) {
      return { success: false, data: null, message: 'Scan not found or access denied.' }
    }

    // Get all cloud files for this scan
    const files = await db.query.cloudFiles.findMany({
      where: eq(schema.cloudFiles.scanId, scanId),
    })

    if (files.length === 0) {
      if (scan.status === 'carving') {
        return {
          success: true,
          data: { scanId, status: 'carving', totalFiles: 0 },
          message: 'Carving is still in progress. Check back shortly.',
        }
      }
      return {
        success: true,
        data: { scanId, status: scan.status, totalFiles: 0 },
        message: 'No files have been recovered yet.',
      }
    }

    // Build breakdown by file type
    const typeMap: Record<string, number> = {}
    const integrityMap: Record<string, number> = { intact: 0, partial: 0, corrupt: 0 }
    let totalSize = 0

    for (const f of files) {
      const category = categorizeFileType(f.fileType)
      typeMap[category] = (typeMap[category] || 0) + 1
      integrityMap[f.integrity] = (integrityMap[f.integrity] || 0) + 1
      totalSize += f.sizeBytes
    }

    // Top file extensions
    const extMap: Record<string, number> = {}
    for (const f of files) {
      const ext = f.fileType.toLowerCase()
      extMap[ext] = (extMap[ext] || 0) + 1
    }
    const topExtensions = Object.entries(extMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ext, count]) => ({ extension: ext, count }))

    return {
      success: true,
      data: {
        scanId,
        totalFiles: files.length,
        totalSize,
        breakdown: typeMap,
        integrity: integrityMap,
        topFileTypes: topExtensions,
      },
      message: `Analysis complete. ${files.length} files detected (${formatBytes(totalSize)}). Breakdown: ${Object.entries(typeMap).map(([k, v]) => `${v} ${k}`).join(', ')}. Integrity: ${integrityMap.intact} intact, ${integrityMap.partial} partial, ${integrityMap.corrupt} corrupt.`,
    }
  },
}

// ─── check_file_integrity ─────────────────────────────────
export const checkFileIntegrity: Tool = {
  name: 'check_file_integrity',
  description: 'Check the integrity of detected files from a scan. Can filter by file type.',
  parameters: {
    type: 'object',
    properties: {
      scan_id: { type: 'string', description: 'The scan ID' },
      file_type: { type: 'string', description: 'Filter by file type category (e.g. "images", "documents", "videos")' },
    },
    required: ['scan_id'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const scanId = String(params.scan_id)
    const fileType = params.file_type ? String(params.file_type) : undefined
    const db = await getDb()

    const scan = await db.query.scans.findFirst({
      where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, ctx.userId)),
    })

    if (!scan) {
      return { success: false, data: null, message: 'Scan not found or access denied.' }
    }

    // Get cloud files
    let files = await db.query.cloudFiles.findMany({
      where: eq(schema.cloudFiles.scanId, scanId),
    })

    // Filter by type category if specified
    if (fileType) {
      files = files.filter(f => categorizeFileType(f.fileType) === fileType)
    }

    const intactCount = files.filter(f => f.integrity === 'intact').length
    const partialCount = files.filter(f => f.integrity === 'partial').length
    const corruptCount = files.filter(f => f.integrity === 'corrupt').length

    return {
      success: true,
      data: {
        scanId,
        fileType: fileType || 'all',
        totalChecked: files.length,
        intact: intactCount,
        partial: partialCount,
        corrupted: corruptCount,
        intactPercentage: files.length > 0 ? Math.round((intactCount / files.length) * 100) : 0,
      },
      message: `Integrity check for ${fileType || 'all files'}: ${intactCount} intact (${files.length > 0 ? Math.round((intactCount / files.length) * 100) : 0}%), ${partialCount} partial, ${corruptCount} corrupt. Partial files may still be usable.`,
    }
  },
}

// ─── diagnose_issue ───────────────────────────────────────
export const diagnoseIssue: Tool = {
  name: 'diagnose_issue',
  description: 'Troubleshoot relay, connection, permission, or drive issues. Returns diagnostic steps and recommended actions.',
  parameters: {
    type: 'object',
    properties: {
      issue_type: { type: 'string', description: 'Type of issue to diagnose', enum: ['relay', 'connection', 'permissions', 'drive'] },
    },
    required: ['issue_type'],
  },
  execute: async (params): Promise<ToolResult> => {
    const issueType = String(params.issue_type)

    const diagnostics: Record<string, { diagnosis: string; steps: string[]; severity: string }> = {
      relay: {
        diagnosis: 'The relay script reads raw bytes from your drive and streams them to our cloud. Common issues include timeout, authentication failure, or permission denied.',
        steps: [
          'Ensure curl is installed: run "which curl" in Terminal',
          'Check internet connectivity: run "ping -c 3 restoreit.app"',
          'Re-run the relay command — it supports resume and will skip already-uploaded chunks',
          'If using a firewall or VPN, allow outbound HTTPS connections to restoreit.app',
          'On macOS: ensure Terminal has Full Disk Access in System Settings > Privacy & Security',
        ],
        severity: 'medium',
      },
      connection: {
        diagnosis: 'Connection issues typically involve network interruptions during the upload.',
        steps: [
          'Check your internet connection stability',
          'Try a wired Ethernet connection for faster, more stable transfers',
          'The relay automatically retries failed chunks (3 attempts)',
          'Re-running the relay command will resume from where it left off',
          'If behind a corporate proxy, the relay may need manual proxy configuration',
        ],
        severity: 'low',
      },
      permissions: {
        diagnosis: 'The relay needs read access to the target drive. Modern operating systems require explicit permission.',
        steps: [
          'macOS: Go to System Settings > Privacy & Security > Full Disk Access > enable Terminal',
          'Windows: Run the relay command as Administrator (right-click > Run as Administrator)',
          'Linux: Run with sudo or ensure your user has read access to the block device',
          'For external drives: ensure the drive is properly mounted before running the relay',
        ],
        severity: 'high',
      },
      drive: {
        diagnosis: 'Drive not detected or not accessible. This may be a hardware or mount issue.',
        steps: [
          'Verify the drive is connected and powered on',
          'Open Disk Utility (macOS) or Disk Management (Windows) to check drive visibility',
          'For USB drives: try a different USB port or cable',
          'If the drive makes clicking sounds, it may have a hardware failure — do not continue scanning',
          'For encrypted drives (FileVault, BitLocker): ensure the volume is unlocked before scanning',
        ],
        severity: 'high',
      },
    }

    const result = diagnostics[issueType]
    if (!result) {
      return { success: false, data: null, message: `Unknown issue type: ${issueType}` }
    }

    return {
      success: true,
      data: { issueType, ...result },
      message: `${result.diagnosis}\n\nRecommended steps:\n${result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    }
  },
}

// ─── prepare_download ─────────────────────────────────────
export const prepareDownload: Tool = {
  name: 'prepare_download',
  description: 'Generate secure download URLs for recovered files from a completed scan. Requires payment.',
  parameters: {
    type: 'object',
    properties: {
      scan_id: { type: 'string', description: 'The scan ID' },
      file_type: { type: 'string', description: 'Optional: filter by file type category to download only specific categories' },
    },
    required: ['scan_id'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const scanId = String(params.scan_id)
    const fileTypeFilter = params.file_type ? String(params.file_type) : undefined
    const db = await getDb()

    const scan = await db.query.scans.findFirst({
      where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, ctx.userId)),
    })

    if (!scan) {
      return { success: false, data: null, message: 'Scan not found or access denied.' }
    }

    if (scan.status !== 'ready') {
      return { success: false, data: null, message: `Scan must be in "ready" status before downloading. Current status: ${scan.status}` }
    }

    // Paywall check
    const payment = await db.query.payments.findFirst({
      where: and(eq(schema.payments.userId, ctx.userId), eq(schema.payments.status, 'completed')),
    })

    if (!payment) {
      return {
        success: false,
        data: { requiresPayment: true, scanId },
        message: 'A plan is required to download detected files. Please choose a plan to proceed.',
      }
    }

    // Get cloud files
    let files = await db.query.cloudFiles.findMany({
      where: and(eq(schema.cloudFiles.scanId, scanId), eq(schema.cloudFiles.userId, ctx.userId)),
    })

    if (fileTypeFilter) {
      files = files.filter(f => categorizeFileType(f.fileType) === fileTypeFilter)
    }

    if (files.length === 0) {
      return {
        success: true,
        data: { scanId, filesReady: 0 },
        message: 'No files found matching the criteria.',
      }
    }

    // Generate presigned download URLs (batch, max 50)
    const downloadLinks = await Promise.all(
      files.slice(0, 50).map(async (f) => ({
        fileId: f.id,
        fileName: f.fileName,
        fileType: f.fileType,
        sizeBytes: f.sizeBytes,
        integrity: f.integrity,
        confidence: f.confidence,
        url: await generateDownloadUrl(f.r2Key, 3600),
        expiresIn: '1 hour',
      }))
    )

    return {
      success: true,
      data: {
        scanId,
        filesReady: downloadLinks.length,
        totalFiles: files.length,
        downloads: downloadLinks,
      },
      message: `${downloadLinks.length} files ready for download${files.length > 50 ? ` (showing first 50 of ${files.length})` : ''}. Links expire in 1 hour.`,
    }
  },
}

// ─── finalize_scan ────────────────────────────────────────
export const finalizeScan: Tool = {
  name: 'finalize_scan',
  description: 'Finalize a scan after all chunks have been uploaded. This triggers the file carving process on the uploaded data.',
  parameters: {
    type: 'object',
    properties: {
      scan_id: { type: 'string', description: 'The scan ID to finalize' },
    },
    required: ['scan_id'],
  },
  execute: async (params, ctx): Promise<ToolResult> => {
    const scanId = String(params.scan_id)
    const db = await getDb()

    const scan = await db.query.scans.findFirst({
      where: and(eq(schema.scans.id, scanId), eq(schema.scans.userId, ctx.userId)),
    })

    if (!scan) {
      return { success: false, data: null, message: 'Scan not found or access denied.' }
    }

    if (scan.status !== 'uploading' && scan.status !== 'created') {
      return { success: false, data: null, message: `Cannot finalize scan in status: ${scan.status}` }
    }

    if (scan.chunksReceived === 0) {
      return { success: false, data: null, message: 'No chunks have been uploaded yet. Run the relay command first.' }
    }

    const now = new Date()

    // Update scan status
    await db
      .update(schema.scans)
      .set({
        status: 'finalized',
        totalChunks: scan.chunksReceived,
      })
      .where(eq(schema.scans.id, scanId))

    // Create carve job
    const jobId = generateId()
    await db.insert(schema.carveJobs).values({
      id: jobId,
      scanId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    return {
      success: true,
      data: {
        scanId,
        jobId,
        chunksReceived: scan.chunksReceived,
        bytesReceived: scan.bytesReceived,
      },
      message: `Scan finalized. ${scan.chunksReceived} chunks (${formatBytes(scan.bytesReceived)}) will now be analyzed for recoverable files. The carving process has been queued — check status with get_scan_status.`,
    }
  },
}

// ─── All tools registry ───────────────────────────────────
export const ALL_TOOLS: Tool[] = [
  scanDrive,
  getScanStatus,
  analyzeResults,
  checkFileIntegrity,
  diagnoseIssue,
  prepareDownload,
  finalizeScan,
]

// ─── Helpers ──────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function categorizeFileType(fileType: string): string {
  const ext = fileType.toLowerCase()
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'heic', 'heif', 'raw', 'cr2', 'nef', 'svg', 'ico']
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp', 'csv', 'pages', 'numbers', 'key']
  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'mpg', 'mpeg']
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'aiff']
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso']

  if (imageExts.includes(ext)) return 'images'
  if (docExts.includes(ext)) return 'documents'
  if (videoExts.includes(ext)) return 'videos'
  if (audioExts.includes(ext)) return 'audio'
  if (archiveExts.includes(ext)) return 'archives'
  return 'other'
}
