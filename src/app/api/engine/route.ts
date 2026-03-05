// Find and restoreit Engine — SSE Streaming API Endpoint

import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { RestoreItAgent } from '@/lib/engine/agent'
import { buildContext } from '@/lib/engine/context'
import type { ConversationMessage } from '@/lib/engine/types'


export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse request body
  let message: string
  let history: ConversationMessage[]
  try {
    const body = await request.json() as { message?: string; history?: ConversationMessage[] }
    message = String(body.message || '').trim()
    history = Array.isArray(body.history) ? body.history : []
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get API key
  const apiKey = process.env.GOOGLE_GENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Engine not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build context and create agent
  const ctx = await buildContext(user.id, history)
  const agent = new RestoreItAgent(apiKey)

  // Stream response as SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agent.stream(message, ctx)) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      } catch (err) {
        const errorData = `data: ${JSON.stringify({
          type: 'error',
          content: err instanceof Error ? err.message : 'Stream error',
        })}\n\n`
        controller.enqueue(encoder.encode(errorData))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
