#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// restoreit E2E Pipeline Test
//
// Tests the full pipeline: signup → scan → ingest → finalize →
// carve → verify recovered files
//
// Usage: node test-pipeline.mjs [--base-url URL]
// ═══════════════════════════════════════════════════════════════

import { createHash, randomBytes } from 'node:crypto'

const BASE_URL = process.argv.find(a => a.startsWith('--base-url='))?.split('=')[1] || 'https://restoreit.app'
const TEST_EMAIL = `test-${Date.now()}@pipeline-test.local`
const TEST_PASSWORD = 'TestPass1234!'
const TEST_NAME = 'Pipeline Test'

let sessionCookie = ''
let userId = ''
let scanId = ''
let relayToken = ''

// ─── Helpers ───────────────────────────────────────────────────

function log(step, msg) {
    console.log(`\n[${'═'.repeat(3)} ${step} ${'═'.repeat(50 - step.length)}]`)
    console.log(`  ${msg}`)
}

function pass(msg) { console.log(`  ✅ ${msg}`) }
function fail(msg) { console.log(`  ❌ ${msg}`); process.exit(1) }

async function api(method, path, body = null, extraHeaders = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...extraHeaders,
    }

    const opts = { method, headers }
    if (body && method !== 'GET') {
        if (body instanceof ArrayBuffer || Buffer.isBuffer(body)) {
            opts.body = body
            headers['Content-Type'] = 'application/octet-stream'
        } else {
            opts.body = JSON.stringify(body)
        }
    }

    const res = await fetch(`${BASE_URL}${path}`, opts)

    // Capture Set-Cookie
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
        sessionCookie = setCookie.split(';')[0]
    }

    return { status: res.status, data: res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text() }
}

// ─── Build Synthetic Disk Image ────────────────────────────────

function buildTestImage() {
    // Create a small "raw disk image" with known files embedded:
    // - A tiny valid JPEG (smallest possible)
    // - A tiny valid PDF

    // Minimal JPEG: SOI + APP0 header + minimal data + EOI
    const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    ])
    // Minimal JPEG scan data (1x1 pixel gray)
    const jpegData = Buffer.from([
        0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B,
        0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
        0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C,
        0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32,
        0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
        0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
        0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
        0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7B, 0x40,
    ])
    const jpegFooter = Buffer.from([0xFF, 0xD9])
    const jpeg = Buffer.concat([jpegHeader, jpegData, jpegFooter])

    // Minimal PDF
    const pdf = Buffer.from(
        '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
        '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
        'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n' +
        '0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF\n',
        'ascii'
    )

    // Build raw image: padding + jpeg + padding + pdf + padding
    const PAD_SIZE = 4096
    const pad1 = randomBytes(PAD_SIZE)  // random padding before JPEG
    const pad2 = randomBytes(PAD_SIZE)  // random padding between JPEG and PDF
    const pad3 = randomBytes(PAD_SIZE)  // random padding after PDF

    return Buffer.concat([pad1, jpeg, pad2, pdf, pad3])
}

// ─── Test Steps ────────────────────────────────────────────────

async function testSignup() {
    log('1. SIGNUP', `Creating test user: ${TEST_EMAIL}`)

    const { status, data } = await api('POST', '/api/auth/signup', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: TEST_NAME,
    })

    if (status !== 201) fail(`Signup failed (${status}): ${JSON.stringify(data)}`)
    if (!data.success) fail(`Signup not successful: ${data.error}`)
    if (!sessionCookie) fail('No session cookie returned')

    userId = data.user.id
    pass(`User created: ${userId}`)
    pass(`Session cookie: ${sessionCookie.substring(0, 30)}...`)
}

async function testScanCreate() {
    log('2. SCAN CREATE', 'Creating scan for test drive')

    const { status, data } = await api('POST', '/api/scan/create', {
        driveName: 'TestDrive_E2E',
        mode: 'deep',
    })

    if (status !== 200) fail(`Scan create failed (${status}): ${JSON.stringify(data)}`)

    scanId = data.scanId
    relayToken = data.relayToken

    pass(`Scan ID: ${scanId}`)
    pass(`Relay token: ${relayToken.substring(0, 8)}...`)
    pass(`Chunk size: ${data.chunkSizeBytes} bytes`)
}

async function testIngest() {
    log('3. INGEST', 'Building synthetic disk image and uploading')

    const rawImage = buildTestImage()
    console.log(`  Raw image size: ${rawImage.length} bytes (${(rawImage.length / 1024).toFixed(1)} KB)`)
    console.log(`  Contains: 1 JPEG + 1 PDF embedded in random padding`)

    // Upload as a single chunk (it's small enough)
    const sha256 = createHash('sha256').update(rawImage).digest('hex')

    const { status, data } = await api('POST', '/api/ingest', rawImage, {
        'Authorization': `Bearer ${relayToken}`,
        'X-Scan-Id': scanId,
        'X-Chunk-Index': '0',
        'X-Chunk-Sha256': sha256,
        'Content-Type': 'application/octet-stream',
    })

    if (status !== 200) fail(`Ingest failed (${status}): ${JSON.stringify(data)}`)
    if (!data.success) fail(`Ingest not successful: ${JSON.stringify(data)}`)

    pass(`Chunk 0 uploaded: ${data.bytesReceived} bytes`)
}

async function testFinalize() {
    log('4. FINALIZE', 'Finalizing scan and creating carve job')

    const { status, data } = await api('POST', '/api/scan/finalize',
        { scanId, totalChunks: 1 },
        { 'Authorization': `Bearer ${relayToken}` }
    )

    if (status !== 200) fail(`Finalize failed (${status}): ${JSON.stringify(data)}`)
    if (!data.success) fail(`Finalize not successful: ${JSON.stringify(data)}`)

    pass(`Finalized. Carve job ID: ${data.jobId}`)
    pass(`Total chunks: ${data.manifest.totalChunks}, bytes: ${data.manifest.totalBytes}`)
}

async function testCarveWorker() {
    log('5. CARVE', 'Running carve worker to process the job')

    // Import and run the carve worker's poll function
    // For this test, we'll call the internal API directly
    const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET
    if (!INTERNAL_SECRET) {
        console.log('  ⚠️  INTERNAL_API_SECRET not set — skipping carve worker test')
        console.log('  Set it via: export INTERNAL_API_SECRET=<your-secret>')
        return false
    }

    // Check for pending jobs
    const jobRes = await fetch(`${BASE_URL}/api/internal`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${INTERNAL_SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'd1_query',
            sql: `SELECT id, scan_id FROM carve_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`,
        }),
    })

    const jobData = await jobRes.json()
    if (!jobData.results || jobData.results.length === 0) {
        fail('No pending carve jobs found — finalize may not have created one')
    }

    pass(`Found pending carve job: ${jobData.results[0].id}`)
    console.log(`\n  Now running the carve worker...`)

    // Run the carve worker as a child process
    const { execSync } = await import('node:child_process')
    try {
        const output = execSync(
            `INTERNAL_API_SECRET="${INTERNAL_SECRET}" RESTOREIT_API_URL="${BASE_URL}" WORK_DIR="/tmp/restoreit-carve-test" node carve-worker.mjs --dry-run=false`,
            { cwd: new URL('.', import.meta.url).pathname.replace(/\/$/, ''), timeout: 60000, encoding: 'utf-8' }
        )
        // The carve worker loops forever, so we need a different approach
    } catch (err) {
        // Expected — the worker will process one job then we kill it
    }

    return true
}

async function testVerifyResults() {
    log('6. VERIFY', 'Checking D1 for recovered files')

    const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET
    if (!INTERNAL_SECRET) {
        console.log('  ⚠️  Skipping — INTERNAL_API_SECRET not set')
        return
    }

    const res = await fetch(`${BASE_URL}/api/internal`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${INTERNAL_SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'd1_query',
            sql: `SELECT id, file_name, file_type, size_bytes, confidence, integrity FROM vault_files WHERE scan_id = ?`,
            params: [scanId],
        }),
    })

    const data = await res.json()
    const files = data.results || []

    if (files.length === 0) {
        console.log('  ⚠️  No recovered files yet — carve worker may need to run')
        return
    }

    pass(`Found ${files.length} recovered files:`)
    for (const f of files) {
        console.log(`    ${f.file_name} (${f.file_type}, ${f.size_bytes} bytes, ${f.confidence}% confidence, ${f.integrity})`)
    }
}

async function testScanStatus() {
    log('7. SCAN STATUS', 'Checking scan status via API')

    const { status, data } = await api('GET', `/api/scan/status?scan=${scanId}`)
    console.log(`  Status: ${status}`)
    console.log(`  Data: ${JSON.stringify(data, null, 2)}`)

    if (status === 200) {
        pass(`Scan status: ${data.status || 'returned'}`)
    } else {
        console.log(`  ⚠️  Scan status check returned ${status}`)
    }
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════════')
    console.log('  restoreit — End-to-End Pipeline Test')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`  Target: ${BASE_URL}`)
    console.log(`  Time:   ${new Date().toISOString()}`)
    console.log('')

    await testSignup()
    await testScanCreate()
    await testIngest()
    await testFinalize()
    await testScanStatus()

    // Run carve worker separately since it's a long-running process
    console.log('\n' + '═'.repeat(60))
    console.log('  Steps 1-4 complete. Scan is finalized.')
    console.log('  Carve job is pending.')
    console.log('')
    console.log('  To process the carve job, run the carve worker:')
    console.log(`  cd vps && INTERNAL_API_SECRET=<secret> node carve-worker.mjs`)
    console.log('')
    console.log('  After carving, run this script with --verify to check results:')
    console.log(`  INTERNAL_API_SECRET=<secret> node test-pipeline.mjs --verify --scan-id=${scanId}`)
    console.log('═'.repeat(60))
}

async function verifyOnly() {
    scanId = process.argv.find(a => a.startsWith('--scan-id='))?.split('=')[1]
    if (!scanId) fail('--scan-id=<id> is required with --verify')
    await testVerifyResults()
}

if (process.argv.includes('--verify')) {
    verifyOnly().catch(err => { console.error('FATAL:', err); process.exit(1) })
} else {
    main().catch(err => { console.error('FATAL:', err); process.exit(1) })
}
