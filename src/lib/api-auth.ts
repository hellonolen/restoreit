/**
 * API key authentication for Restore-as-a-Service partners.
 * Keys are prefixed rstr_live_ (production) or rstr_test_ (sandbox).
 * Only the SHA-256 hash is stored in D1.
 */

import { getDb } from '@/db'
import { partners } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkRateLimit } from './rate-limit'
import type { PartnerContext, ApiErrorResponse } from './api-types'

const API_KEY_PREFIX_LIVE = 'rstr_live_'
const API_KEY_PREFIX_TEST = 'rstr_test_'
const API_KEY_RANDOM_LENGTH = 32

/**
 * Generate a new API key (shown once to partner, never stored).
 */
export function generateApiKey(isTest = false): string {
  const prefix = isTest ? API_KEY_PREFIX_TEST : API_KEY_PREFIX_LIVE
  const bytes = new Uint8Array(API_KEY_RANDOM_LENGTH)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}${hex}`
}

/**
 * Generate a webhook signing secret.
 */
export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return `whsec_${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`
}

/**
 * SHA-256 hash an API key for storage/lookup.
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Authenticate an API request by Bearer token.
 * Returns PartnerContext on success, or an error response.
 */
export async function authenticateApiKey(
  request: Request
): Promise<{ partner: PartnerContext } | { error: Response }> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: apiError('Missing or invalid Authorization header', 'auth_missing', 401) }
  }

  const apiKey = authHeader.slice(7)

  if (!apiKey.startsWith(API_KEY_PREFIX_LIVE) && !apiKey.startsWith(API_KEY_PREFIX_TEST)) {
    return { error: apiError('Invalid API key format', 'auth_invalid', 401) }
  }

  const keyHash = await hashApiKey(apiKey)
  const db = await getDb()

  const rows = await db
    .select({
      id: partners.id,
      userId: partners.userId,
      name: partners.name,
      email: partners.email,
      tier: partners.tier,
      rateLimit: partners.rateLimit,
      monthlyGbLimit: partners.monthlyGbLimit,
      isActive: partners.isActive,
    })
    .from(partners)
    .where(and(eq(partners.apiKeyHash, keyHash), eq(partners.isActive, true)))
    .limit(1)

  if (rows.length === 0) {
    return { error: apiError('Invalid or inactive API key', 'auth_invalid', 401) }
  }

  const partner = rows[0] as PartnerContext

  // Per-partner rate limiting
  const rateResult = checkRateLimit(partner.id, 'api_v1', {
    max: partner.rateLimit,
    windowSeconds: 60,
  })

  if (!rateResult.allowed) {
    const retryAfter = Math.ceil((rateResult.resetAt - Date.now()) / 1000)
    return {
      error: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          code: 'rate_limited',
          details: `Limit: ${partner.rateLimit} requests/min. Retry after ${retryAfter}s.`,
        } satisfies ApiErrorResponse),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(partner.rateLimit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateResult.resetAt / 1000)),
          },
        }
      ),
    }
  }

  return { partner }
}

/**
 * Build a JSON error response.
 */
export function apiError(message: string, code: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, code } satisfies ApiErrorResponse),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

/**
 * Build a JSON success response.
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
