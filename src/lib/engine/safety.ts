// Find and RestoreIt Engine — Safety Guardrails

import type { ToolResult } from './types'

const MAX_TOOL_CALLS_PER_TURN = 10
const MAX_TOOL_CALLS_PER_SESSION = 60

const DESTRUCTIVE_TOOLS = new Set(['prepare_download'])

interface SafetyState {
  toolCallsThisTurn: number
  toolCallsThisSession: number
}

export function createSafetyState(): SafetyState {
  return {
    toolCallsThisTurn: 0,
    toolCallsThisSession: 0,
  }
}

export function resetTurnCount(state: SafetyState): SafetyState {
  return { ...state, toolCallsThisTurn: 0 }
}

export function validateToolCall(
  toolName: string,
  params: Record<string, unknown>,
  state: SafetyState
): { allowed: boolean; reason?: string; updatedState: SafetyState } {
  // Rate limiting
  if (state.toolCallsThisTurn >= MAX_TOOL_CALLS_PER_TURN) {
    return {
      allowed: false,
      reason: `Rate limit: maximum ${MAX_TOOL_CALLS_PER_TURN} tool calls per turn reached`,
      updatedState: state,
    }
  }

  if (state.toolCallsThisSession >= MAX_TOOL_CALLS_PER_SESSION) {
    return {
      allowed: false,
      reason: `Session limit: maximum ${MAX_TOOL_CALLS_PER_SESSION} tool calls per session reached`,
      updatedState: state,
    }
  }

  // Input sanitization — reject empty or suspiciously large inputs
  const paramsStr = JSON.stringify(params)
  if (paramsStr.length > 10_000) {
    return {
      allowed: false,
      reason: 'Input too large',
      updatedState: state,
    }
  }

  // Destructive action warning (returned in tool result, not blocked)
  const requiresConfirmation = DESTRUCTIVE_TOOLS.has(toolName)

  const updatedState = {
    toolCallsThisTurn: state.toolCallsThisTurn + 1,
    toolCallsThisSession: state.toolCallsThisSession + 1,
  }

  return { allowed: true, updatedState, reason: requiresConfirmation ? 'requires_confirmation' : undefined }
}

export function createBlockedResult(reason: string): ToolResult {
  return {
    success: false,
    data: null,
    message: `Blocked: ${reason}`,
  }
}
