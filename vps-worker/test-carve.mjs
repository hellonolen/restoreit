#!/usr/bin/env node
// Test harness — creates a fake disk image with embedded files,
// uploads to R2 via /api/internal, inserts D1 records, and
// lets the carve worker process it.

const WORKER_URL = process.env.WORKER_URL
const WORKER_SECRET = process.env.WORKER_SECRET

if (!WORKER_URL || !WORKER_SECRET) {
  console.error('Set WORKER_URL and WORKER_SECRET env vars')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${WORKER_SECRET}`,
  'Content-Type': 'application/json',
}

// ─── Helpers ───────────────────────────────────────────

async function d1Query(sql, params = []) {
  const res = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'd1_query', sql, params }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(`D1 error: ${JSON.stringify(data)}`)
  return data.results ?? []
}

async function r2Put(key, buffer, contentType = 'application/octet-stream') {
  const res = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${WORKER_SECRET}`,
      'Content-Type': contentType,
      'X-R2-Key': key,
    },
    body: buffer,
  })
  const data = await res.json()
  if (!data.success) throw new Error(`R2 PUT error: ${JSON.stringify(data)}`)
  return data
}

async function r2List(prefix) {
  const res = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'r2_list', prefix }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(`R2 list error: ${JSON.stringify(data)}`)
  return data.keys ?? []
}

function randomBytes(n) {
  const buf = new Uint8Array(n)
  for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256)
  return buf
}

// ─── Build test disk image ─────────────────────────────

function buildTestImage() {
  // A minimal valid JPEG (smallest possible — 107 bytes)
  // FFD8FF E0 (JFIF header) ... FFD9
  const jpegHeader = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00,
  ])
  // Minimal JPEG image data + footer
  const jpegBody = randomBytes(200)
  const jpegFooter = new Uint8Array([0xFF, 0xD9])

  // Minimal valid PNG (89504E47 0D0A1A0A ... IEND AE426082)
  const pngHeader = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    // IHDR chunk (13 bytes data)
    0x00, 0x00, 0x00, 0x0D, // chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00,
    0x90, 0x77, 0x53, 0xDE, // CRC
    // IDAT chunk (minimal)
    0x00, 0x00, 0x00, 0x0C, // chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,
    0x00, 0x02, 0x00, 0x01,
    0xE2, 0x21, 0xBC, 0x33, // CRC
  ])
  const pngFooter = new Uint8Array([
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82, // CRC
  ])

  // Minimal PDF
  const pdfContent = new TextEncoder().encode(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
    'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n' +
    '0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
  )

  // Layout: [garbage 1KB] [JPEG ~220B] [garbage 2KB] [PNG ~80B] [garbage 1KB] [PDF ~300B] [garbage 1KB]
  const gap1 = randomBytes(1024)
  const gap2 = randomBytes(2048)
  const gap3 = randomBytes(1024)
  const gap4 = randomBytes(1024)

  const parts = [gap1, jpegHeader, jpegBody, jpegFooter, gap2, pngHeader, pngFooter, gap3, pdfContent, gap4]
  const totalLen = parts.reduce((s, p) => s + p.length, 0)
  const image = new Uint8Array(totalLen)
  let offset = 0
  for (const part of parts) {
    image.set(part, offset)
    offset += part.length
  }

  console.log(`[test] Built test disk image: ${totalLen} bytes`)
  console.log(`[test]   JPEG at offset ~1024 (${jpegHeader.length + jpegBody.length + jpegFooter.length} bytes)`)
  console.log(`[test]   PNG at offset ~${1024 + jpegHeader.length + jpegBody.length + jpegFooter.length + 2048} (${pngHeader.length + pngFooter.length} bytes)`)
  console.log(`[test]   PDF at offset ~${totalLen - 1024 - pdfContent.length} (${pdfContent.length} bytes)`)
  return image
}

// ─── Main ──────────────────────────────────────────────

async function main() {
  const testScanId = `test-${Date.now()}`
  const testUserId = 'test-user-carve'
  const testJobId = `job-${Date.now()}`

  console.log(`\n=== RestoreIt Carve Engine Test ===`)
  console.log(`Scan ID:  ${testScanId}`)
  console.log(`Job ID:   ${testJobId}`)
  console.log(`Target:   ${WORKER_URL}\n`)

  // Step 1: Verify API connectivity
  console.log('[1/6] Verifying API connectivity...')
  try {
    const rows = await d1Query('SELECT COUNT(*) as cnt FROM scans')
    console.log(`  ✓ D1 connected (${rows[0]?.cnt ?? 0} existing scans)\n`)
  } catch (err) {
    console.error(`  ✗ D1 connection failed: ${err.message}`)
    process.exit(1)
  }

  // Step 2: Ensure test user exists
  console.log('[2/6] Creating test user...')
  const existingUser = await d1Query('SELECT id FROM users WHERE id = ?', [testUserId])
  if (existingUser.length === 0) {
    await d1Query(
      'INSERT INTO users (id, email, first_name, password_hash, is_demo, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [testUserId, 'carve-test@restoreit.app', 'Test', '$2a$12$placeholder', 1, Date.now()]
    )
    console.log('  ✓ Test user created\n')
  } else {
    console.log('  ✓ Test user already exists\n')
  }

  // Step 3: Build and upload test disk image
  console.log('[3/6] Building test disk image...')
  const diskImage = buildTestImage()

  console.log('[3/6] Uploading to R2...')
  const r2Key = `raw/${testScanId}/chunk-000.bin`
  await r2Put(r2Key, diskImage)
  console.log(`  ✓ Uploaded ${r2Key} (${diskImage.length} bytes)\n`)

  // Step 4: Create scan record
  console.log('[4/6] Creating scan record in D1...')
  await d1Query(
    'INSERT INTO scans (id, user_id, drive_name, mode, status, files_found, data_size, restore_rate, chunk_size_bytes, total_chunks, chunks_received, bytes_received, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [testScanId, testUserId, 'TEST_DRIVE', 'deep', 'finalized', 0, 0, 0, 16777216, 1, 1, diskImage.length, Date.now()]
  )
  console.log(`  ✓ Scan record created (status: finalized)\n`)

  // Step 5: Create carve job (this triggers the VPS worker)
  console.log('[5/6] Creating carve job (pending)...')
  await d1Query(
    'INSERT INTO carve_jobs (id, scan_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [testJobId, testScanId, 'pending', Date.now(), Date.now()]
  )
  console.log(`  ✓ Carve job created — worker should pick it up within 5 seconds\n`)

  // Step 6: Poll for completion
  console.log('[6/6] Waiting for carve worker to process...')
  const startTime = Date.now()
  const TIMEOUT_MS = 60_000

  while (Date.now() - startTime < TIMEOUT_MS) {
    await new Promise(r => setTimeout(r, 3000))
    const jobs = await d1Query('SELECT status, error FROM carve_jobs WHERE id = ?', [testJobId])
    const job = jobs[0]
    if (!job) {
      console.log('  ⏳ Job not found (deleted?)')
      break
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    if (job.status === 'completed') {
      console.log(`  ✓ Job completed in ${elapsed}s\n`)

      // Check results
      const scan = await d1Query('SELECT files_found, data_size, status FROM scans WHERE id = ?', [testScanId])
      const vaultFiles = await d1Query('SELECT id, file_name, file_type, size_bytes, confidence, integrity, r2_key FROM vault_files WHERE scan_id = ?', [testScanId])
      const r2Keys = await r2List(`vault/${testScanId}/`)

      console.log('=== RESULTS ===')
      console.log(`Scan status:   ${scan[0]?.status}`)
      console.log(`Files found:   ${scan[0]?.files_found}`)
      console.log(`Data size:     ${scan[0]?.data_size} bytes`)
      console.log(`R2 vault keys: ${r2Keys.length}`)
      console.log('')

      if (vaultFiles.length > 0) {
        console.log('Carved files:')
        for (const f of vaultFiles) {
          console.log(`  ${f.file_name}  type=${f.file_type}  size=${f.size_bytes}B  confidence=${f.confidence}%  integrity=${f.integrity}  r2=${f.r2_key}`)
        }
      } else {
        console.log('(no vault files found in D1)')
      }

      // Check R2 for report
      const reportKeys = await r2List(`reports/${testScanId}/`)
      if (reportKeys.length > 0) {
        console.log(`\nReport stored: ${reportKeys.join(', ')}`)
      }

      console.log('\n✓ TEST PASSED — carving engine works end-to-end')
      return
    }

    if (job.status === 'failed') {
      console.log(`  ✗ Job failed after ${elapsed}s: ${job.error}`)
      console.log('\n✗ TEST FAILED')
      process.exit(1)
    }

    if (job.status === 'processing') {
      console.log(`  ⏳ Processing... (${elapsed}s)`)
    } else {
      console.log(`  ⏳ Status: ${job.status} (${elapsed}s)`)
    }
  }

  console.log('  ✗ Timed out waiting for job completion')
  process.exit(1)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
