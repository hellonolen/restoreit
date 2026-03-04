import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export type Database = ReturnType<typeof createDb>

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

export async function getDb(): Promise<Database> {
  // In Cloudflare Workers environment, use getCloudflareContext
  // For local dev, this is handled by wrangler
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  return createDb((env as Record<string, unknown>).DB as D1Database)
}

export { schema }
