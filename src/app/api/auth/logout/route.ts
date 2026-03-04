import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, buildClearSessionCookie } from '@/lib/auth'

const SESSION_COOKIE_NAME = 'restoreit_session'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

    if (sessionCookie?.value) {
      await deleteSession(sessionCookie.value)
    }

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', buildClearSessionCookie())
    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear the cookie even if DB delete fails
    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', buildClearSessionCookie())
    return response
  }
}
