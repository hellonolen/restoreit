import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createCheckoutSession, WHOP_PLANS } from '@/lib/whop'

const VALID_TIERS = ['standard', 'pro', 'protection'] as const
type Tier = (typeof VALID_TIERS)[number]

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { tier: Tier; devices?: number }
    const { tier } = body
    const devices = Math.max(1, Math.min(5, Math.floor(Number(body.devices) || 1)))

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { success: false, error: `tier must be one of: ${VALID_TIERS.join(', ')}` },
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

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://restoreit.app'

    const checkoutUrl = await createCheckoutSession({
      planId,
      userId: user.id,
      tier,
      quantity: devices,
      redirectUrl: `${origin}/account?checkout=success`,
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
