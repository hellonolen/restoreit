// POST /api/internal — Internal API for VPS carve worker
// Proxies D1 and R2 operations so VPS only needs one shared secret.
// SECURITY: Whitelisted SQL operations only. No arbitrary queries.

const ALLOWED_SQL_PATTERNS = [
  /^SELECT\s/i,
  /^UPDATE\s+scans\s/i,
  /^UPDATE\s+carve_jobs\s/i,
  /^UPDATE\s+api_jobs\s/i,
  /^INSERT\s+INTO\s+scans\s/i,
  /^INSERT\s+INTO\s+vault_files\s/i,
  /^INSERT\s+INTO\s+carve_jobs\s/i,
  /^INSERT\s+INTO\s+api_usage\s/i,
] as const

function isSqlAllowed(sql: string): boolean {
  const trimmed = sql.trim()
  return ALLOWED_SQL_PATTERNS.some(pattern => pattern.test(trimmed))
}

async function getCfEnv(): Promise<Record<string, unknown>> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  return env as Record<string, unknown>
}

function verifyAuth(request: Request, secret: string): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ') || !secret) return false

  const token = authHeader.slice(7)
  // Constant-time comparison to prevent timing attacks
  if (token.length !== secret.length) return false
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ secret.charCodeAt(i)
  }
  return result === 0
}

export async function POST(request: Request) {
  try {
    const cfEnv = await getCfEnv()
    const secret = (cfEnv.INTERNAL_API_SECRET as string) ?? ''

    if (!verifyAuth(request, secret)) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const body = (await request.json()) as {
      action: string
      sql?: string
      params?: unknown[]
      key?: string
      prefix?: string
    }

    const { action } = body

    // ─── D1 query (whitelisted only) ────────────────
    if (action === 'd1_query') {
      if (!body.sql) {
        return json({ error: 'sql is required' }, 400)
      }
      if (!isSqlAllowed(body.sql)) {
        return json({ error: 'Query not allowed' }, 403)
      }
      const d1 = cfEnv.DB as D1Database
      const stmt = d1.prepare(body.sql).bind(...(body.params ?? []))
      const result = await stmt.all()
      return json({ success: true, results: result.results })
    }

    // ─── R2 read ────────────────────────────────────
    if (action === 'r2_get') {
      if (!body.key) return json({ error: 'key is required' }, 400)
      const r2 = cfEnv.VAULT as R2Bucket
      const obj = await r2.get(body.key)
      if (!obj) return json({ error: 'Not found' }, 404)
      const data = await obj.arrayBuffer()
      return new Response(data, {
        headers: {
          'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
          'Content-Length': String(data.byteLength),
        },
      })
    }

    // ─── R2 list ────────────────────────────────────
    if (action === 'r2_list') {
      const r2 = cfEnv.VAULT as R2Bucket
      const keys: string[] = []
      let cursor: string | undefined
      do {
        const listed = await r2.list({ prefix: body.prefix ?? '', cursor })
        for (const obj of listed.objects) keys.push(obj.key)
        cursor = listed.truncated ? listed.cursor : undefined
      } while (cursor)
      return json({ success: true, keys })
    }

    return json({ error: `Unknown action: ${action}` }, 400)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    console.error('Internal API error:', msg)
    return json({ error: 'Internal server error' }, 500)
  }
}

// PUT handler for binary R2 uploads
export async function PUT(request: Request) {
  try {
    const cfEnv = await getCfEnv()
    const secret = (cfEnv.INTERNAL_API_SECRET as string) ?? ''

    if (!verifyAuth(request, secret)) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const r2Key = request.headers.get('X-R2-Key')
    if (!r2Key) return json({ error: 'X-R2-Key header required' }, 400)

    const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream'
    const r2 = cfEnv.VAULT as R2Bucket
    const body = await request.arrayBuffer()
    await r2.put(r2Key, body, { httpMetadata: { contentType } })
    return json({ success: true, key: r2Key, size: body.byteLength })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    console.error('Internal API PUT error:', msg)
    return json({ error: 'Internal server error' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
