import { eq, and, gt } from 'drizzle-orm'
import { getDb } from '@/db'
import { users, sessions } from '@/db/schema'

const SESSION_COOKIE_NAME = 'restoreit_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
  id: string
  email: string
  firstName: string
  isDemo: boolean
}

/**
 * Reads session cookie, looks up session in D1, returns user or null.
 */
export async function getSessionUser(
  cookies: { get(name: string): { value: string } | undefined }
): Promise<SessionUser | null> {
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME)
  if (!sessionCookie) {
    return null
  }

  const token = sessionCookie.value
  if (!token) {
    return null
  }

  const db = await getDb()

  const sessionRows = await db
    .select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1)

  if (sessionRows.length === 0) {
    return null
  }

  const session = sessionRows[0]

  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      isDemo: users.isDemo,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (userRows.length === 0) {
    return null
  }

  return userRows[0]
}

/**
 * Creates a session record in D1 and returns the token.
 */
export async function createSession(userId: string): Promise<string> {
  const db = await getDb()
  const sessionId = generateId()
  const token = generateId()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
    createdAt: now,
  })

  return token
}

/**
 * Deletes a session by token.
 */
export async function deleteSession(token: string): Promise<void> {
  const db = await getDb()
  await db.delete(sessions).where(eq(sessions.token, token))
}

/**
 * Simple SHA-256 hash for development. Replace with bcrypt/argon2 for production.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates a random UUID.
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Builds the Set-Cookie header value for session token.
 */
export function buildSessionCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

/**
 * Builds the Set-Cookie header value to clear the session.
 */
export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}
