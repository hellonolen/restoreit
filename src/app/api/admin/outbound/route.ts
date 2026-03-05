// GET /api/admin/outbound — Proxy to the outbound worker's /api/pipeline endpoint (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

// The worker URL — no secrets stored here, just a public endpoint that requires auth
const WORKER_URL = 'https://restoreit-outbound-agent.hellonolen.workers.dev/api/pipeline'

export async function GET(request: NextRequest) {
    const user = await getSessionUser(request.cookies)
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!user.isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    try {
        const res = await fetch(WORKER_URL, {
            headers: {
                'Authorization': `Bearer ${process.env.OUTBOUND_ADMIN_SECRET}`,
            },
        })

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json({ error: `Worker returned ${res.status}: ${text}` }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (err) {
        console.error('[API] Failed to reach outbound worker:', err)
        return NextResponse.json({ error: 'Failed to connect to outbound engine' }, { status: 502 })
    }
}
