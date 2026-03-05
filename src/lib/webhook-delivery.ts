/**
 * Webhook delivery for RaaS partners.
 * Signs payloads with HMAC-SHA256 using the partner's webhook secret.
 * Retries up to 3 times with exponential backoff.
 * Logs all delivery attempts to webhook_logs table.
 */

import type { WebhookPayload } from './api-types'
import { getDb } from '@/db'
import { webhookLogs } from '@/db/schema'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

/**
 * Sign a webhook payload with HMAC-SHA256.
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Deliver a webhook to a partner's callback URL.
 * Logs delivery result to webhook_logs.
 * Returns true if delivery succeeded (2xx), false otherwise.
 */
export async function deliverWebhook(
  callbackUrl: string,
  payload: WebhookPayload,
  webhookSecret: string,
  partnerId?: string,
  apiJobId?: string,
): Promise<boolean> {
  const body = JSON.stringify(payload)
  const timestamp = Math.floor(Date.now() / 1000)
  const signedContent = `${timestamp}.${body}`
  const signature = await signPayload(signedContent, webhookSecret)

  let lastStatusCode: number | undefined
  let lastError: string | undefined
  let success = false
  let attempts = 0

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    attempts = attempt + 1
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-restoreit-Signature': `v1=${signature}`,
          'X-restoreit-Timestamp': String(timestamp),
          'User-Agent': 'restoreit-Webhooks/1.0',
        },
        body,
      })

      lastStatusCode = response.status

      if (response.ok) {
        success = true
        break
      }

      lastError = `${response.status} ${response.statusText}`
      console.error(
        `[webhook] Delivery failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${lastError}`
      )
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      console.error(
        `[webhook] Network error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        lastError
      )
    }

    if (attempt < MAX_RETRIES) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, backoff))
    }
  }

  // Log delivery attempt
  if (partnerId) {
    try {
      const db = await getDb()
      await db.insert(webhookLogs).values({
        id: crypto.randomUUID(),
        partnerId,
        apiJobId: apiJobId ?? null,
        event: 'event' in payload ? String((payload as { event: string }).event) : 'unknown',
        callbackUrl,
        statusCode: lastStatusCode ?? null,
        success,
        attempts,
        errorMessage: success ? null : (lastError ?? null),
        deliveredAt: new Date(),
      })
    } catch (logErr) {
      console.error('[webhook] Failed to log delivery:', logErr)
    }
  }

  return success
}

