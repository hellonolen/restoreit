// API Job Pipeline — downloads partner disk images and feeds them into the carve system
// Polls for queued api_jobs, downloads image, chunks to R2, creates scan + carve_job

import { query } from './d1-client.js'
import { putObject } from './r2-client.js'

const CHUNK_SIZE = 16 * 1024 * 1024 // 16MB — matches existing chunk size
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000 // 10 min per image download

export interface QueuedApiJob {
  id: string
  partner_id: string
  image_url: string | null
  scan_mode: string
  file_types: string | null
  callback_url: string | null
  external_ref: string | null
}

/** Find the next queued API job */
export async function getQueuedApiJob(): Promise<QueuedApiJob | null> {
  const rows = await query(
    'SELECT * FROM api_jobs WHERE status = ? ORDER BY created_at ASC LIMIT 1',
    ['queued']
  )
  return (rows[0] as unknown as QueuedApiJob) ?? null
}

/** Claim an API job for processing */
async function claimApiJob(jobId: string): Promise<boolean> {
  await query(
    'UPDATE api_jobs SET status = ? WHERE id = ? AND status = ?',
    ['downloading', jobId, 'queued']
  )
  const rows = await query('SELECT status FROM api_jobs WHERE id = ?', [jobId])
  return (rows[0] as Record<string, unknown>)?.status === 'downloading'
}

/** Download image from URL, chunk to R2, create scan + carve_job */
export async function ingestApiJob(job: QueuedApiJob): Promise<void> {
  if (!job.image_url) {
    throw new Error('No image_url provided — partner must upload via /api/v1/restore/upload first')
  }

  console.log(`[pipeline] Downloading image for API job ${job.id} from ${job.image_url}`)

  // Download the image
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(job.image_url, { signal: controller.signal })
  } catch (err) {
    clearTimeout(timeout)
    throw new Error(`Failed to download image: ${err instanceof Error ? err.message : err}`)
  }

  if (!response.ok) {
    clearTimeout(timeout)
    throw new Error(`Image download failed: HTTP ${response.status}`)
  }

  if (!response.body) {
    clearTimeout(timeout)
    throw new Error('Image response has no body')
  }

  // Create internal scan record
  const scanId = crypto.randomUUID()
  const now = Date.now()

  await query(
    `INSERT INTO scans (id, user_id, drive_name, mode, status, chunk_size_bytes, total_chunks, chunks_received, bytes_received, started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [scanId, job.partner_id, `api-job-${job.id}`, job.scan_mode, 'uploading', CHUNK_SIZE, null, 0, 0, now]
  )

  // Link API job to internal scan
  await query('UPDATE api_jobs SET scan_id = ?, status = ? WHERE id = ?', [scanId, 'downloading', job.id])

  // Stream the download, chunking to R2
  const reader = response.body.getReader()
  let buffer = new Uint8Array(0)
  let chunkIndex = 0
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (value) {
        // Append to buffer
        const combined = new Uint8Array(buffer.length + value.length)
        combined.set(buffer)
        combined.set(value, buffer.length)
        buffer = combined

        // Flush full chunks
        while (buffer.length >= CHUNK_SIZE) {
          const chunk = buffer.slice(0, CHUNK_SIZE)
          buffer = buffer.slice(CHUNK_SIZE)

          const key = `raw/${scanId}/chunk-${chunkIndex}.bin`
          await putObject(key, chunk, 'application/octet-stream')
          chunkIndex++
          totalBytes += chunk.length

          // Update scan progress
          await query(
            'UPDATE scans SET chunks_received = ?, bytes_received = ? WHERE id = ?',
            [chunkIndex, totalBytes, scanId]
          )

          if (chunkIndex % 10 === 0) {
            console.log(`[pipeline] Job ${job.id}: ${chunkIndex} chunks uploaded (${formatBytes(totalBytes)})`)
          }
        }
      }

      if (done) break
    }

    // Flush remaining buffer as last chunk
    if (buffer.length > 0) {
      const key = `raw/${scanId}/chunk-${chunkIndex}.bin`
      await putObject(key, buffer, 'application/octet-stream')
      chunkIndex++
      totalBytes += buffer.length
    }
  } finally {
    clearTimeout(timeout)
  }

  console.log(`[pipeline] Job ${job.id}: Download complete. ${chunkIndex} chunks, ${formatBytes(totalBytes)}`)

  // Finalize scan
  await query(
    'UPDATE scans SET status = ?, total_chunks = ?, chunks_received = ?, bytes_received = ? WHERE id = ?',
    ['finalized', chunkIndex, chunkIndex, totalBytes, scanId]
  )

  // Write manifest
  const manifest = {
    scanId,
    chunkSizeBytes: CHUNK_SIZE,
    totalChunks: chunkIndex,
    totalBytes,
    chunksReceived: chunkIndex,
    chunkHashes: [],
    finalizedAt: new Date().toISOString(),
  }
  await putObject(`manifests/${scanId}.json`, JSON.stringify(manifest, null, 2), 'application/json')

  // Create carve_job
  const carveJobId = crypto.randomUUID()
  await query(
    'INSERT INTO carve_jobs (id, scan_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [carveJobId, scanId, 'pending', now, now]
  )

  // Update API job status to processing
  await query('UPDATE api_jobs SET status = ? WHERE id = ?', ['processing', job.id])

  console.log(`[pipeline] Job ${job.id}: Scan ${scanId} created, carve_job ${carveJobId} queued`)
}

/** Main pipeline poll — call from worker loop */
export async function processApiJobQueue(): Promise<boolean> {
  const job = await getQueuedApiJob()
  if (!job) return false

  const claimed = await claimApiJob(job.id)
  if (!claimed) {
    console.log(`[pipeline] API job ${job.id} already claimed`)
    return false
  }

  try {
    await ingestApiJob(job)
    return true
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[pipeline] API job ${job.id} failed:`, errorMessage)
    await query(
      'UPDATE api_jobs SET status = ?, error = ?, completed_at = ? WHERE id = ?',
      ['failed', errorMessage, Date.now(), job.id]
    )
    return false
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
