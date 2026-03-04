/**
 * Webhook delivery for RaaS partners.
 * Signs payloads with HMAC-SHA256 using the partner's webhook secret.
 * Retries up to 3 times with exponential backoff.
 */

import type { WebhookPayload } from './api-types'

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
 * Returns true if delivery succeeded (2xx), false otherwise.
 */
export async function deliverWebhook(
  callbackUrl: string,
  payload: WebhookPayload,
  webhookSecret: string
): Promise<boolean> {
  const body = JSON.stringify(payload)
  const timestamp = Math.floor(Date.now() / 1000)
  const signedContent = `${timestamp}.${body}`
  const signature = await signPayload(signedContent, webhookSecret)

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

  return false
}
