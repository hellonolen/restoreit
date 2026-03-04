// Webhook delivery for RaaS API job notifications
// Signs payloads with HMAC-SHA256, retries with exponential backoff

import { createHmac } from 'node:crypto'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

export interface WebhookPayload {
  event: 'restore.completed' | 'restore.failed'
  job_id: string
  external_ref?: string | null
  status: string
  files_found: number
  data_restored_bytes: number
  error?: string | null
  timestamp: string
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export async function deliverWebhook(
  callbackUrl: string,
  payload: WebhookPayload,
  webhookSecret: string
): Promise<boolean> {
  const body = JSON.stringify(payload)
  const timestamp = Math.floor(Date.now() / 1000)
  const signedContent = `${timestamp}.${body}`
  const signature = signPayload(signedContent, webhookSecret)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RestoreIt-Signature': `v1=${signature}`,
          'X-RestoreIt-Timestamp': String(timestamp),
          'User-Agent': 'RestoreIt-Webhooks/1.0',
        },
        body,
      })

      if (response.ok) {
        console.log(`[webhook] Delivered to ${callbackUrl} (${response.status})`)
        return true
      }

      console.error(
        `[webhook] Delivery failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${response.status} ${response.statusText}`
      )
    } catch (err) {
      console.error(
        `[webhook] Network error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        err instanceof Error ? err.message : err
      )
    }

    if (attempt < MAX_RETRIES) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, backoff))
    }
  }

  console.error(`[webhook] All ${MAX_RETRIES + 1} attempts failed for ${callbackUrl}`)
  return false
}
