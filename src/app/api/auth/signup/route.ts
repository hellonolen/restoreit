import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import {
  hashPassword,
  createSession,
  buildSessionCookie,
  generateId,
} from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, 'signup', RATE_LIMITS.signup)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = (await request.json()) as { email: string; password: string; firstName: string }
    const { email, password, firstName } = body

    // --- Validation ---
    if (!email || !password || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and first name are required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.toLowerCase().trim()
    const trimmedName = firstName.trim()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (trimmedName.length === 0) {
      return NextResponse.json(
        { success: false, error: 'First name cannot be empty' },
        { status: 400 }
      )
    }

    // --- Check for existing user ---
    const db = await getDb()

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // --- Create user ---
    const userId = generateId()
    const passwordHash = await hashPassword(password)
    const now = new Date()

    await db.insert(users).values({
      id: userId,
      email: trimmedEmail,
      firstName: trimmedName,
      passwordHash,
      isDemo: true,
      createdAt: now,
    })

    // --- Create session ---
    const token = await createSession(userId)

    // --- Send welcome email (non-blocking) ---
    try {
      await sendWelcomeEmail(trimmedEmail, trimmedName)
    } catch (emailError) {
      console.error('Welcome email failed (non-critical):', emailError)
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email: trimmedEmail,
          firstName: trimmedName,
          isDemo: true,
        },
      },
      { status: 201 }
    )

    response.headers.set('Set-Cookie', buildSessionCookie(token))
    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
