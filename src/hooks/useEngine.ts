// Find and RestoreIt Engine — Frontend Hook

"use client"

import { useState, useCallback, useRef } from 'react'
import type { EngineStreamChunk, ConversationMessage, ScanState } from '@/lib/engine/types'

export interface EngineMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  chunks: EngineStreamChunk[]
  isStreaming: boolean
}

interface UseEngineReturn {
  messages: EngineMessage[]
  isStreaming: boolean
  scanState: ScanState | null
  send: (message: string) => Promise<void>
  reset: () => void
}

export function useEngine(): UseEngineReturn {
  const [messages, setMessages] = useState<EngineMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [scanState, setScanState] = useState<ScanState | null>(null)
  const conversationRef = useRef<ConversationMessage[]>([])

  const send = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming) return

    // Add user message
    const userMsg: EngineMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
      chunks: [],
      isStreaming: false,
    }

    setMessages(prev => [...prev, userMsg])
    conversationRef.current = [...conversationRef.current, { role: 'user', content: message }]
    setIsStreaming(true)

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      chunks: [],
      isStreaming: true,
    }])

    try {
      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: conversationRef.current.slice(0, -1), // Exclude current message (server adds it)
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Engine error' })) as { error?: string }
        throw new Error(errorData.error || `Engine returned ${res.status}`)
      }

      // Read SSE stream
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6)
          if (!jsonStr.trim()) continue

          try {
            const chunk = JSON.parse(jsonStr) as EngineStreamChunk

            // Accumulate text
            if (chunk.type === 'text' && chunk.content) {
              fullText += chunk.content
            }

            // Update scan state from tool results
            if (chunk.type === 'tool_result' && chunk.toolResult?.success) {
              const data = chunk.toolResult.data as Record<string, unknown>
              if (data && typeof data.scanId === 'string' && typeof data.status === 'string') {
                setScanState({
                  id: data.scanId as string,
                  status: mapScanStatus(data.status as string),
                  progress: (data.progress as number) || 0,
                  filesFound: (data.filesFound as number) || 0,
                  dataSize: (data.dataSize as number) || 0,
                  sectorsScanned: (data.sectorsScanned as number) || 0,
                  totalSectors: (data.totalSectors as number) || 0,
                  driveName: (data.driveName as string) || '',
                  mode: (data.mode as 'quick' | 'deep') || 'quick',
                })
              }
            }

            // Append chunk to assistant message
            if (chunk.type !== 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, chunks: [...m.chunks, chunk], content: fullText }
                  : m
              ))
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Finalize assistant message
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, isStreaming: false, content: fullText }
          : m
      ))

      // Store in conversation history
      if (fullText) {
        conversationRef.current = [...conversationRef.current, { role: 'assistant', content: fullText }]
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection error'
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? {
              ...m,
              isStreaming: false,
              content: errorMsg,
              chunks: [{ type: 'error', content: errorMsg }],
            }
          : m
      ))
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming])

  const reset = useCallback(() => {
    setMessages([])
    setScanState(null)
    conversationRef.current = []
    setIsStreaming(false)
  }, [])

  return { messages, isStreaming, scanState, send, reset }
}

function mapScanStatus(status: string): ScanState['status'] {
  switch (status) {
    case 'scanning':
    case 'uploading':
    case 'created':
    case 'finalized':
    case 'carving':
      return 'scanning'
    case 'completed':
    case 'ready':
      return 'completed'
    case 'failed':
    case 'cancelled':
      return 'failed'
    default:
      return 'idle'
  }
}
