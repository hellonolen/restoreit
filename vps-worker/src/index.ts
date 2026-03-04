// RestoreIt Carve Worker — job polling loop
// Runs on VPS in Docker, polls D1 for pending carve jobs

import {
  getPendingJob, claimJob, completeJob, failJob,
  getScan, updateScanStatus,
  getApiJobByScanId, updateApiJob, getPartnerWebhookSecret, recordApiUsage,
} from './d1-client.js'
import { carve } from './carver.js'
import { putObject } from './r2-client.js'
import { deliverWebhook } from './webhook.js'
import type { WebhookPayload } from './webhook.js'
import { processApiJobQueue } from './api-job-pipeline.js'

const POLL_INTERVAL_MS = 5000 // 5 seconds
const MAX_CONSECUTIVE_ERRORS = 50 // Allow more retries before giving up
const MAX_BACKOFF_MS = 60000 // 60 seconds max backoff

async function processJob(jobId: string, scanId: string): Promise<{ filesFound: number; totalBytes: number }> {
  console.log(`[worker] Processing job ${jobId} for scan ${scanId}`)

  // Get scan info
  const scan = await getScan(scanId)
  if (!scan) {
    throw new Error(`Scan ${scanId} not found`)
  }

  // Update scan status to carving
  await updateScanStatus(scanId, 'carving')

  // Run carving pipeline
  const result = await carve(scanId, scan.user_id)

  // Write carve report to R2
  const report = {
    scanId,
    jobId,
    completedAt: new Date().toISOString(),
    ...result,
  }
  await putObject(
    `reports/${scanId}/carve.json`,
    JSON.stringify(report, null, 2),
    'application/json'
  )

  // Update scan status to ready
  await updateScanStatus(scanId, 'ready')

  console.log(`[worker] Job ${jobId} complete. ${result.filesFound} files carved.`)
  return { filesFound: result.filesFound, totalBytes: result.totalSize }
}

/** After carve completes, update linked API job and fire webhook */
async function notifyApiJob(scanId: string, outcome: 'completed' | 'failed', filesFound: number, totalBytes: number, error?: string): Promise<void> {
  try {
    const apiJob = await getApiJobByScanId(scanId)
    if (!apiJob) return // Not an API-submitted job

    console.log(`[worker] Linked API job ${apiJob.id} — updating status to ${outcome}`)

    // Update the API job record
    await updateApiJob(apiJob.id, {
      status: outcome,
      filesFound,
      dataRecovered: totalBytes,
      error,
    })

    // Record usage metrics
    if (outcome === 'completed') {
      await recordApiUsage(apiJob.partner_id, 'files_restored', filesFound, apiJob.id)
    }

    // Fire webhook if callback URL is configured
    if (apiJob.callback_url) {
      const webhookSecret = await getPartnerWebhookSecret(apiJob.partner_id)
      if (webhookSecret) {
        const payload: WebhookPayload = {
          event: outcome === 'completed' ? 'restore.completed' : 'restore.failed',
          job_id: apiJob.id,
          external_ref: apiJob.external_ref,
          status: outcome,
          files_found: filesFound,
          data_restored_bytes: totalBytes,
          error: error ?? null,
          timestamp: new Date().toISOString(),
        }
        await deliverWebhook(apiJob.callback_url, payload, webhookSecret)
      } else {
        console.warn(`[webhook] No webhook secret for partner ${apiJob.partner_id}, skipping`)
      }
    }
  } catch (err) {
    // Webhook/notification failure should not crash the worker
    console.error('[worker] API job notification failed:', err instanceof Error ? err.message : err)
  }
}

async function pollLoop(): Promise<void> {
  let consecutiveErrors = 0

  console.log('[worker] RestoreIt Carve Worker started')
  console.log(`[worker] Polling every ${POLL_INTERVAL_MS / 1000}s for pending jobs...`)

  while (true) {
    try {
      // Check for queued API jobs that need image download + ingestion
      try {
        const processed = await processApiJobQueue()
        if (processed) {
          consecutiveErrors = 0
          continue // Re-poll immediately — the new carve_job will be picked up next iteration
        }
      } catch (err) {
        console.error('[worker] API job pipeline error:', err instanceof Error ? err.message : err)
      }

      const job = await getPendingJob()

      if (job) {
        consecutiveErrors = 0

        // Try to claim the job (optimistic locking)
        const claimed = await claimJob(job.id)
        if (!claimed) {
          console.log(`[worker] Job ${job.id} already claimed by another worker`)
          continue
        }

        try {
          const result = await processJob(job.id, job.scan_id)
          await completeJob(job.id)
          await notifyApiJob(job.scan_id, 'completed', result.filesFound, result.totalBytes)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          console.error(`[worker] Job ${job.id} failed:`, errorMessage)
          await failJob(job.id, errorMessage)

          // Update scan to failed
          try {
            await updateScanStatus(job.scan_id, 'failed')
          } catch {
            console.error(`[worker] Failed to update scan status for ${job.scan_id}`)
          }

          await notifyApiJob(job.scan_id, 'failed', 0, 0, errorMessage)
        }
      }
    } catch (err) {
      consecutiveErrors++
      const backoff = Math.min(POLL_INTERVAL_MS * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS)
      console.error(`[worker] Poll error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}), retrying in ${Math.round(backoff / 1000)}s:`, err instanceof Error ? err.message : err)

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error(`[worker] Too many consecutive errors, exiting`)
        process.exit(1)
      }

      await new Promise(resolve => setTimeout(resolve, backoff))
      continue
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[worker] Received SIGTERM, shutting down...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('[worker] Received SIGINT, shutting down...')
  process.exit(0)
})

// Validate required environment variables
const REQUIRED_ENV = ['WORKER_URL', 'WORKER_SECRET']
const missing = REQUIRED_ENV.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(`[worker] Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

// Start
pollLoop().catch(err => {
  console.error('[worker] Fatal error:', err)
  process.exit(1)
})
