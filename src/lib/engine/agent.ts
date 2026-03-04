// Find and RestoreIt Engine — Core Agent

import { GoogleGenerativeAI, type GenerativeModel, type Content, type Part, SchemaType } from '@google/generative-ai'
import type { AgentRole, EngineContext, EngineStreamChunk, Tool, ToolResult } from './types'
import { ALL_TOOLS } from './tools'
import { createSafetyState, validateToolCall, createBlockedResult, resetTurnCount } from './safety'

const INTENT_KEYWORDS: Record<AgentRole, string[]> = {
  recovery: ['scan', 'find', 'restore', 'recover', 'files', 'photos', 'documents', 'deleted', 'lost', 'missing', 'drive', 'disk', 'format', 'accidentally', 'wedding', 'pictures', 'music', 'videos', 'backup'],
  troubleshooting: ['error', 'fail', 'failed', 'timeout', 'slow', 'permission', 'denied', 'relay', 'stuck', 'crash', 'disconnect', 'broken', 'not working', 'issue', 'problem', 'bug', 'help with'],
  support: ['how', 'what', 'explain', 'pricing', 'plan', 'cost', 'account', 'work', 'safe', 'secure', 'privacy', 'data', 'encrypt', 'terms', 'about', 'why', 'difference', 'compare'],
}

const SYSTEM_PROMPTS: Record<AgentRole, string> = {
  recovery: `You are the Find and RestoreIt Engine, a cloud-based file restoration system. Your role is to help users scan their drives and detect files that may be recoverable.

CRITICAL RULES:
- NEVER guarantee that any files will be restored. Restoration success depends on the physical state of the storage device.
- NEVER promise specific outcomes. Use language like "detected", "may be recoverable", "the scan found".
- You help users by scanning their drives, analyzing what the scan detects, and preparing files for download.
- Be empathetic — users are often stressed because they lost important files.
- Be concise and action-oriented. Users want results, not lengthy explanations.

WORKFLOW:
1. Understand what the user lost (file types, when, which drive)
2. Start a scan with scan_drive (suggest quick mode first, deep if needed)
3. Check progress with get_scan_status
4. When complete, analyze with analyze_results
5. Check specific file integrity with check_file_integrity if asked
6. Help download with prepare_download

CONTEXT:
{{context}}`,

  troubleshooting: `You are the Find and RestoreIt Engine's troubleshooting system. Your role is to diagnose and resolve issues users encounter with the relay, their connection, permissions, or drives.

CRITICAL RULES:
- Be specific and actionable. Give step-by-step instructions.
- NEVER blame the user. Frame solutions constructively.
- If a hardware issue is suspected (clicking drive, physical damage), advise the user to stop scanning immediately to prevent further damage.

Use the diagnose_issue tool to get specific diagnostic steps for the user's problem.

CONTEXT:
{{context}}`,

  support: `You are the Find and RestoreIt Engine's support system. Your role is to answer questions about how RestoreIt works, pricing, security, and capabilities.

CRITICAL RULES:
- NEVER guarantee restoration outcomes. Always say "results vary depending on drive condition."
- Be honest about limitations. If asked something we can't do, say so.
- Don't upsell aggressively. Present options factually.
- Explain the relay concept simply: it reads your drive from memory, never writes to it, and streams data to our cloud securely.

KEY FACTS:
- RestoreIt uses a memory-only relay that performs zero write operations to the affected drive
- Data is encrypted in transit (TLS) and at rest (AES-256)
- Standard plan: single restoration, download immediately
- Pro plan: 500GB cloud storage, 7-day retention, unlimited re-downloads
- Scans are free — users only pay if files are detected

CONTEXT:
{{context}}`,
}

export class RestoreItAgent {
  private tools: Tool[]
  private model: GenerativeModel
  private safetyState = createSafetyState()

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey)

    // Build function declarations for Gemini — use plain objects to avoid strict type conflicts
    const functionDeclarations = ALL_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: SchemaType.OBJECT as const,
        properties: Object.fromEntries(
          Object.entries(t.parameters.properties).map(([key, param]) => {
            const prop: Record<string, unknown> = {
              type: param.type === 'string' ? SchemaType.STRING : SchemaType.NUMBER,
              description: param.description,
            }
            if (param.enum) {
              prop.format = 'enum'
              prop.enum = param.enum
            }
            return [key, prop]
          })
        ),
        required: t.parameters.required || [],
      },
    }))

    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ functionDeclarations: functionDeclarations as any }],
    })

    this.tools = ALL_TOOLS
  }

  classifyIntent(message: string): AgentRole {
    const lower = message.toLowerCase()
    const scores: Record<AgentRole, number> = { recovery: 0, troubleshooting: 0, support: 0 }

    for (const [role, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          scores[role as AgentRole] += 1
        }
      }
    }

    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)
    return (sorted[0][1] > 0 ? sorted[0][0] : 'support') as AgentRole
  }

  private buildSystemPrompt(role: AgentRole, ctx: EngineContext): string {
    const contextLines: string[] = []

    if (ctx.userProfile) {
      contextLines.push(`User: ${ctx.userProfile.firstName} (${ctx.userProfile.email})`)
    }

    if (ctx.scanState) {
      contextLines.push(`Active scan: ${ctx.scanState.driveName} — ${ctx.scanState.status} (${ctx.scanState.progress}% complete, ${ctx.scanState.filesFound} files detected)`)
    } else {
      contextLines.push('No active scan.')
    }

    const contextStr = contextLines.join('\n')
    return SYSTEM_PROMPTS[role].replace('{{context}}', contextStr)
  }

  async *stream(message: string, ctx: EngineContext): AsyncGenerator<EngineStreamChunk> {
    this.safetyState = resetTurnCount(this.safetyState)
    const role = this.classifyIntent(message)
    const systemPrompt = this.buildSystemPrompt(role, ctx)

    // Build conversation history for Gemini
    const history: Content[] = ctx.conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = this.model.startChat({
      systemInstruction: systemPrompt,
      history,
    })

    yield { type: 'thinking', content: `Analyzing your request...` }

    try {
      let continueLoop = true

      // Initial message
      let result = await chat.sendMessage(message)
      let response = result.response

      while (continueLoop) {
        continueLoop = false
        const parts = response.candidates?.[0]?.content?.parts || []

        for (const part of parts) {
          // Handle text response
          if (part.text) {
            yield { type: 'text', content: part.text }
          }

          // Handle function calls
          if (part.functionCall) {
            const { name: toolName, args: toolArgs } = part.functionCall
            const toolInput = (toolArgs || {}) as Record<string, unknown>

            yield { type: 'tool_use', toolName, toolInput }

            // Find and execute the tool
            const tool = this.tools.find(t => t.name === toolName)
            let toolResult: ToolResult

            if (!tool) {
              toolResult = { success: false, data: null, message: `Unknown tool: ${toolName}` }
            } else {
              // Safety check
              const safety = validateToolCall(toolName, toolInput, this.safetyState)
              this.safetyState = safety.updatedState

              if (!safety.allowed) {
                toolResult = createBlockedResult(safety.reason || 'Safety check failed')
              } else {
                try {
                  toolResult = await tool.execute(toolInput, ctx)
                } catch (err) {
                  toolResult = {
                    success: false,
                    data: null,
                    message: `Tool execution error: ${err instanceof Error ? err.message : 'Unknown error'}`,
                  }
                }
              }
            }

            yield { type: 'tool_result', toolName, toolResult }

            // Send function response back to Gemini to continue the conversation
            const functionResponseParts: Part[] = [{
              functionResponse: {
                name: toolName,
                response: toolResult,
              },
            }]

            result = await chat.sendMessage(functionResponseParts)
            response = result.response
            continueLoop = true
            break // Restart the parts loop with new response
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      yield { type: 'error', content: errorMessage }
    }

    yield { type: 'done' }
  }
}
