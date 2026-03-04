/**
 * Restore-as-a-Service (RaaS) API types
 */

// Partner context attached to authenticated API requests
export interface PartnerContext {
  id: string
  userId: string
  name: string
  email: string
  tier: 'starter' | 'growth' | 'enterprise'
  rateLimit: number
  monthlyGbLimit: number | null
  isActive: boolean
}

// POST /api/v1/restore/jobs
export interface CreateJobRequest {
  image_url?: string       // URL to fetch disk image from
  r2_key?: string          // Already-uploaded R2 key
  scan_mode?: 'quick' | 'deep'
  file_types?: string[]    // Filter: ["jpg", "pdf", "docx"]
  callback_url?: string    // Webhook URL for completion
  external_ref?: string    // Partner's reference ID
}

export interface CreateJobResponse {
  job_id: string
  status: 'queued'
  estimated_wait: string
  poll_url: string
}

// GET /api/v1/restore/jobs/:id
export interface JobStatusResponse {
  job_id: string
  external_ref: string | null
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'failed'
  files_found: number
  data_restored: number
  error: string | null
  created_at: string
  completed_at: string | null
}

// GET /api/v1/restore/jobs/:id/files
export interface RestoredFile {
  file_id: string
  file_name: string
  file_type: string
  size_bytes: number
  confidence: number
  integrity: 'intact' | 'partial' | 'corrupt'
  sha256: string | null
  download_url: string
}

export interface JobFilesResponse {
  job_id: string
  files: RestoredFile[]
  total: number
}

// GET /api/v1/usage
export interface UsageSummary {
  partner_id: string
  tier: string
  period: string           // "2026-03"
  jobs_created: number
  gb_scanned: number
  files_restored: number
  rate_limit: number
  monthly_gb_limit: number | null
  gb_remaining: number | null
}

// Webhook payload
export interface WebhookPayload {
  event: 'restore.completed' | 'restore.failed'
  job_id: string
  external_ref: string | null
  status: string
  files_found: number
  data_restored_bytes: number
  results_url: string
  timestamp: string
}

// Standard API error response
export interface ApiErrorResponse {
  error: string
  code: string
  details?: string
}
