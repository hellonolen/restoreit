// Conversion funnel event tracking — fire-and-forget, never breaks main flow

import { getDb } from '@/db'
import { funnelEvents } from '@/db/schema'

type FunnelEvent =
  | 'signup'
  | 'scan_created'
  | 'scan_completed'
  | 'checkout_opened'
  | 'checkout_redirected'
  | 'payment_completed'
  | 'partner_checkout_opened'
  | 'partner_checkout_redirected'
  | 'partner_payment_completed'

interface TrackEventParams {
  userId: string
  event: FunnelEvent
  scanId?: string | null
  tier?: string | null
  channel?: 'consumer' | 'partner'
  metadata?: Record<string, unknown>
}

export async function trackFunnelEvent({
  userId,
  event,
  scanId,
  tier,
  channel = 'consumer',
  metadata,
}: TrackEventParams): Promise<void> {
  try {
    const db = await getDb()
    await db.insert(funnelEvents).values({
      id: crypto.randomUUID(),
      userId,
      scanId: scanId ?? null,
      event,
      tier: tier ?? null,
      channel,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date(),
    })
  } catch (error) {
    // Funnel tracking must never break the main flow
    console.error('Funnel tracking error:', error)
  }
}
