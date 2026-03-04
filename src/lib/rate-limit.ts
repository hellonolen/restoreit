/**
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Uses a sliding window approach keyed by IP address.
 * State resets on cold starts (acceptable for edge workers).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 60s to prevent memory leaks
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 60_000

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

interface RateLimitOptions {
  /** Max requests per window */
  max: number
  /** Window duration in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  ip: string,
  action: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanup()

  const key = `${action}:${ip}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 })
    return { allowed: true, remaining: options.max - 1, resetAt: now + options.windowSeconds * 1000 }
  }

  entry.count++

  if (entry.count > options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: options.max - entry.count, resetAt: entry.resetAt }
}

/** Pre-configured rate limits */
export const RATE_LIMITS = {
  login: { max: 5, windowSeconds: 60 },       // 5 attempts per minute
  signup: { max: 3, windowSeconds: 300 },      // 3 signups per 5 minutes
  contact: { max: 3, windowSeconds: 600 },     // 3 contact forms per 10 minutes
  checkout: { max: 10, windowSeconds: 60 },    // 10 checkout attempts per minute
} as const

/** Extract client IP from request */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}
