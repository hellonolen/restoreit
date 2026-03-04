// D1 Client — access Cloudflare D1 via internal Worker API proxy

const WORKER_URL = process.env.WORKER_URL ?? ''
const WORKER_SECRET = process.env.WORKER_SECRET ?? ''

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${WORKER_SECRET}`,
    'Content-Type': 'application/json',
  }
}

export async function query(sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ action: 'd1_query', sql, params }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`D1 API error (${response.status}): ${text}`)
  }

  const data = (await response.json()) as { success: boolean; results: Record<string, unknown>[]; error?: string }
  if (!data.success) {
    throw new Error(`D1 query failed: ${data.error ?? 'unknown error'}`)
  }

  return data.results ?? []
}

// ─── Typed helpers ───────────────────────────────────────

export interface CarveJob {
  id: string
  scan_id: string
  status: string
  error: string | null
  created_at: number
  updated_at: number
}

export interface ScanRow {
  id: string
  user_id: string
  drive_name: string
  mode: string
  status: string
  chunk_size_bytes: number
  total_chunks: number | null
  chunks_received: number
  bytes_received: number
}

export async function getPendingJob(): Promise<CarveJob | null> {
  const rows = await query(
    'SELECT * FROM carve_jobs WHERE status = ? ORDER BY created_at ASC LIMIT 1',
    ['pending']
  )
  return (rows[0] as unknown as CarveJob) ?? null
}

export async function claimJob(jobId: string): Promise<boolean> {
  await query(
    'UPDATE carve_jobs SET status = ?, updated_at = ? WHERE id = ? AND status = ?',
    ['processing', Date.now(), jobId, 'pending']
  )
  // Check if we actually claimed it (simple optimistic lock)
  const rows = await query('SELECT status FROM carve_jobs WHERE id = ?', [jobId])
  return (rows[0] as Record<string, unknown>)?.status === 'processing'
}

export async function completeJob(jobId: string): Promise<void> {
  await query(
    'UPDATE carve_jobs SET status = ?, updated_at = ? WHERE id = ?',
    ['completed', Date.now(), jobId]
  )
}

export async function failJob(jobId: string, error: string): Promise<void> {
  await query(
    'UPDATE carve_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?',
    ['failed', error, Date.now(), jobId]
  )
}

export async function getScan(scanId: string): Promise<ScanRow | null> {
  const rows = await query('SELECT * FROM scans WHERE id = ?', [scanId])
  return (rows[0] as unknown as ScanRow) ?? null
}

export async function updateScanStatus(scanId: string, status: string): Promise<void> {
  await query('UPDATE scans SET status = ? WHERE id = ?', [status, scanId])
}

export async function updateScanFilesFound(scanId: string, filesFound: number, dataSize: number): Promise<void> {
  await query(
    'UPDATE scans SET files_found = ?, data_size = ? WHERE id = ?',
    [filesFound, dataSize, scanId]
  )
}

export async function insertCloudFile(file: {
  id: string
  userId: string
  scanId: string
  fileName: string
  fileType: string
  sizeBytes: number
  r2Key: string
  startOffset: number | null
  endOffset: number | null
  sha256: string | null
  confidence: number
  integrity: string
}): Promise<void> {
  await query(
    `INSERT INTO vault_files (id, user_id, scan_id, file_name, file_type, size_bytes, r2_key, start_offset, end_offset, sha256, confidence, integrity, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      file.id,
      file.userId,
      file.scanId,
      file.fileName,
      file.fileType,
      file.sizeBytes,
      file.r2Key,
      file.startOffset,
      file.endOffset,
      file.sha256,
      file.confidence,
      file.integrity,
      Date.now(),
    ]
  )
}

// ─── RaaS API job helpers ───────────────────────────────

export interface ApiJob {
  id: string
  partner_id: string
  external_ref: string | null
  scan_id: string | null
  callback_url: string | null
  status: string
  files_found: number
  data_recovered: number
}

/** Find the API job linked to a scan (if any) */
export async function getApiJobByScanId(scanId: string): Promise<ApiJob | null> {
  const rows = await query('SELECT * FROM api_jobs WHERE scan_id = ?', [scanId])
  return (rows[0] as unknown as ApiJob) ?? null
}

/** Update API job status and results */
export async function updateApiJob(
  jobId: string,
  update: { status: string; filesFound?: number; dataRecovered?: number; error?: string }
): Promise<void> {
  const now = Date.now()
  if (update.status === 'completed' || update.status === 'failed') {
    await query(
      'UPDATE api_jobs SET status = ?, files_found = ?, data_recovered = ?, error = ?, completed_at = ? WHERE id = ?',
      [update.status, update.filesFound ?? 0, update.dataRecovered ?? 0, update.error ?? null, now, jobId]
    )
  } else {
    await query('UPDATE api_jobs SET status = ? WHERE id = ?', [update.status, jobId])
  }
}

/** Get partner's webhook secret */
export async function getPartnerWebhookSecret(partnerId: string): Promise<string | null> {
  const rows = await query('SELECT webhook_secret FROM partners WHERE id = ?', [partnerId])
  return (rows[0] as Record<string, unknown>)?.webhook_secret as string | null
}

/** Record usage event */
export async function recordApiUsage(
  partnerId: string,
  event: 'job_created' | 'gb_scanned' | 'files_restored',
  quantity: number,
  apiJobId?: string
): Promise<void> {
  await query(
    'INSERT INTO api_usage (id, partner_id, api_job_id, event, quantity, recorded_at) VALUES (?, ?, ?, ?, ?, ?)',
    [crypto.randomUUID(), partnerId, apiJobId ?? null, event, quantity, Date.now()]
  )
}
