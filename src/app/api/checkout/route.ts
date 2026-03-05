import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createCheckoutSession, WHOP_PLANS, CONSUMER_TIERS, PARTNER_TIERS } from '@/lib/whop'
import { trackFunnelEvent } from '@/lib/funnel'

const ALL_TIERS = [...CONSUMER_TIERS, ...PARTNER_TIERS] as const
type Tier = (typeof ALL_TIERS)[number]

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      tier: Tier
      devices?: number
      locations?: number
      type?: 'consumer' | 'partner'
      scanId?: string
    }
    const { tier } = body
    const scanId = body.scanId ?? null
    const checkoutType = body.type ?? (PARTNER_TIERS.includes(tier as typeof PARTNER_TIERS[number]) ? 'partner' : 'consumer')
    const quantity = Math.max(1, Math.min(5, Math.floor(Number(checkoutType === 'partner' ? body.locations : body.devices) || 1)))

    if (!tier || !ALL_TIERS.includes(tier)) {
      return NextResponse.json(
        { success: false, error: `tier must be one of: ${ALL_TIERS.join(', ')}` },
        { status: 400 }
      )
    }

    const planId = WHOP_PLANS[tier]
    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan not configured for this tier' },
        { status: 500 }
      )
    }

    // Track checkout opened
    const openedEvent = checkoutType === 'partner' ? 'partner_checkout_opened' : 'checkout_opened' as const
    await trackFunnelEvent({
      userId: user.id,
      event: openedEvent,
      scanId,
      tier,
      channel: checkoutType,
      metadata: { quantity },
    })

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://restoreit.app'
    const successRedirect = checkoutType === 'partner'
      ? `${origin}/account/partner-dashboard?checkout=success`
      : `${origin}/account?checkout=success`

    const checkoutUrl = await createCheckoutSession({
      planId,
      userId: user.id,
      tier,
      quantity,
      redirectUrl: successRedirect,
      checkoutType,
      scanId: scanId ?? undefined,
    })

    // Track checkout redirected (Whop URL generated)
    const redirectedEvent = checkoutType === 'partner' ? 'partner_checkout_redirected' : 'checkout_redirected' as const
    await trackFunnelEvent({
      userId: user.id,
      event: redirectedEvent,
      scanId,
      tier,
      channel: checkoutType,
    })

    return NextResponse.json({ success: true, url: checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
