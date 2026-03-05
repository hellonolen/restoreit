// Find and restoreit Engine — Type Definitions

export type AgentRole = 'recovery' | 'troubleshooting' | 'support'

export interface ToolParameter {
  type: string
  description: string
  enum?: string[]
}

export interface ToolSchema {
  type: 'object'
  properties: Record<string, ToolParameter>
  required?: string[]
}

export interface Tool {
  name: string
  description: string
  parameters: ToolSchema
  execute: (params: Record<string, unknown>, ctx: EngineContext) => Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  data: unknown
  message: string
}

export interface EngineContext {
  userId: string
  scanId?: string
  driveId?: string
  conversationHistory: ConversationMessage[]
  scanState?: ScanState
  userProfile?: {
    email: string
    firstName: string
    isDemo: boolean
  }
}

export interface ScanState {
  id: string
  status: 'idle' | 'scanning' | 'completed' | 'failed'
  progress: number
  filesFound: number
  dataSize: number
  sectorsScanned: number
  totalSectors: number
  driveName: string
  mode: 'quick' | 'deep'
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface EngineStreamChunk {
  type: 'thinking' | 'text' | 'tool_use' | 'tool_result' | 'error' | 'done'
  content?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  toolResult?: ToolResult
}

export interface EngineMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  chunks?: EngineStreamChunk[]
  isStreaming?: boolean
}
