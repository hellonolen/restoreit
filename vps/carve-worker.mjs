#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// restoreit Carve Worker — VPS file reconstruction engine
//
// Polls D1 for pending carve_jobs, downloads raw drive chunks
// from R2, performs signature-based file carving, and uploads
// recovered files back to R2.
//
// Zero external dependencies — uses only Node.js built-ins.
// ═══════════════════════════════════════════════════════════════

import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, rm, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

// ─── Config ────────────────────────────────────────────────────

const API_URL = process.env.RESTOREIT_API_URL || 'https://restoreit.app'
const SECRET = process.env.INTERNAL_API_SECRET || ''
const WORK_DIR = process.env.WORK_DIR || '/tmp/restoreit-carve'
const POLL_MS = parseInt(process.env.POLL_INTERVAL_MS || '30000', 10)
const DRY_RUN = process.argv.includes('--dry-run')

if (!SECRET) {
    console.error('FATAL: INTERNAL_API_SECRET is not set')
    process.exit(1)
}

// ─── File Signatures (Magic Bytes) ─────────────────────────────

const SIGNATURES = [
    { ext: 'jpg', mime: 'image/jpeg', header: Buffer.from([0xFF, 0xD8, 0xFF]), footer: Buffer.from([0xFF, 0xD9]), maxSize: 50 * 1024 * 1024 },
    { ext: 'png', mime: 'image/png', header: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), footer: Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]), maxSize: 50 * 1024 * 1024 },
    { ext: 'pdf', mime: 'application/pdf', header: Buffer.from([0x25, 0x50, 0x44, 0x46]), footer: Buffer.from('%%EOF', 'ascii'), maxSize: 200 * 1024 * 1024 },
    { ext: 'gif', mime: 'image/gif', header: Buffer.from([0x47, 0x49, 0x46, 0x38]), footer: Buffer.from([0x00, 0x3B]), maxSize: 30 * 1024 * 1024 },
    { ext: 'zip', mime: 'application/zip', header: Buffer.from([0x50, 0x4B, 0x03, 0x04]), footer: null, maxSize: 500 * 1024 * 1024 },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', header: Buffer.from([0x50, 0x4B, 0x03, 0x04]), footer: null, maxSize: 100 * 1024 * 1024 },
    { ext: 'bmp', mime: 'image/bmp', header: Buffer.from([0x42, 0x4D]), footer: null, maxSize: 50 * 1024 * 1024 },
    { ext: 'mp4', mime: 'video/mp4', header: Buffer.from('ftyp', 'ascii'), footer: null, maxSize: 2 * 1024 * 1024 * 1024, headerOffset: 4 },
    { ext: 'mov', mime: 'video/quicktime', header: Buffer.from('ftypqt', 'ascii'), footer: null, maxSize: 2 * 1024 * 1024 * 1024, headerOffset: 4 },
    { ext: 'tiff', mime: 'image/tiff', header: Buffer.from([0x49, 0x49, 0x2A, 0x00]), footer: null, maxSize: 200 * 1024 * 1024 },
]

// ─── Internal API helpers ──────────────────────────────────────

async function apiPost(action, body = {}) {
    const res = await fetch(`${API_URL}/api/internal`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...body }),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${action} failed (${res.status}): ${text}`)
    }
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return res.json()
    }
    // Binary response (R2 get)
    return res.arrayBuffer()
}

async function apiPut(r2Key, data, contentType = 'application/octet-stream') {
    const res = await fetch(`${API_URL}/api/internal`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${SECRET}`,
            'X-R2-Key': r2Key,
            'Content-Type': contentType,
        },
        body: data,
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`API PUT ${r2Key} failed (${res.status}): ${text}`)
    }
    return res.json()
}

async function d1Query(sql, params = []) {
    const result = await apiPost('d1_query', { sql, params })
    return result.results || []
}

// ─── Carving Logic ─────────────────────────────────────────────

function findSignature(buffer, offset) {
    for (const sig of SIGNATURES) {
        const checkOffset = offset + (sig.headerOffset || 0)
        if (checkOffset + sig.header.length > buffer.length) continue

        let match = true
        for (let i = 0; i < sig.header.length; i++) {
            if (buffer[checkOffset + i] !== sig.header[i]) {
                match = false
                break
            }
        }
        if (match) return { ...sig, matchOffset: offset }
    }
    return null
}

function findFooter(buffer, startOffset, sig) {
    if (!sig.footer) return null
    const maxSearch = Math.min(startOffset + sig.maxSize, buffer.length)

    for (let i = startOffset + sig.header.length; i < maxSearch - sig.footer.length + 1; i++) {
        let match = true
        for (let j = 0; j < sig.footer.length; j++) {
            if (buffer[i + j] !== sig.footer[j]) {
                match = false
                break
            }
        }
        if (match) return i + sig.footer.length
    }
    return null
}

function carveFiles(rawBuffer) {
    const results = []
    const buffer = Buffer.from(rawBuffer)
    let fileCounter = 0

    log(`  Scanning ${formatBytes(buffer.length)} of raw data...`)

    for (let offset = 0; offset < buffer.length - 4; offset++) {
        const sig = findSignature(buffer, offset)
        if (!sig) continue

        let endOffset
        let integrity = 'intact'

        if (sig.footer) {
            endOffset = findFooter(buffer, offset, sig)
            if (!endOffset) {
                // No footer found — take up to maxSize or next signature
                endOffset = Math.min(offset + sig.maxSize, buffer.length)
                integrity = 'partial'
            }
        } else {
            // No footer defined — for ZIP/DOCX, try to parse the size from headers
            // For BMP, read size from header bytes 2-5 (little-endian)
            if (sig.ext === 'bmp' && offset + 6 <= buffer.length) {
                const bmpSize = buffer.readUInt32LE(offset + 2)
                if (bmpSize > 0 && bmpSize <= sig.maxSize && offset + bmpSize <= buffer.length) {
                    endOffset = offset + bmpSize
                }
            }
            // Fallback: take a reasonable chunk
            if (!endOffset) {
                endOffset = Math.min(offset + 1024 * 1024, buffer.length) // 1MB default for headerless
                integrity = 'partial'
            }
        }

        const fileSize = endOffset - offset
        if (fileSize < 100) continue // Skip tiny fragments

        const fileData = buffer.subarray(offset, endOffset)
        const sha256 = createHash('sha256').update(fileData).digest('hex')

        // Check for duplicates
        if (results.some(r => r.sha256 === sha256)) {
            offset = endOffset - 1 // Skip past this file
            continue
        }

        fileCounter++
        const confidence = integrity === 'intact' ? 95 : integrity === 'partial' ? 60 : 30
        const fileName = `recovered_${String(fileCounter).padStart(4, '0')}.${sig.ext}`

        results.push({
            fileName,
            fileType: sig.mime,
            ext: sig.ext,
            sizeBytes: fileSize,
            startOffset: offset,
            endOffset,
            sha256,
            confidence,
            integrity,
            data: fileData,
        })

        log(`  Found: ${fileName} (${formatBytes(fileSize)}, ${integrity}, ${confidence}% confidence)`)

        // Jump past this file
        offset = endOffset - 1
    }

    return results
}

// ─── Job Processing ────────────────────────────────────────────

async function processJob(job) {
    const { id: jobId, scan_id: scanId } = job
    const jobDir = join(WORK_DIR, jobId)

    log(`\n${'═'.repeat(60)}`)
    log(`Processing carve job: ${jobId}`)
    log(`Scan: ${scanId}`)
    log('═'.repeat(60))

    try {
        // 1. Claim the job
        await d1Query(
            `UPDATE carve_jobs SET status = 'processing', updated_at = ? WHERE id = ?`,
            [Date.now(), jobId]
        )

        // 2. Get manifest
        log('  Downloading manifest...')
        const manifestBuf = await apiPost('r2_get', { key: `manifests/${scanId}.json` })
        const manifest = JSON.parse(Buffer.from(manifestBuf).toString('utf-8'))
        log(`  Manifest: ${manifest.totalChunks} chunks, ${formatBytes(manifest.totalBytes)}`)

        // 3. Create work directory
        await mkdir(jobDir, { recursive: true })

        // 4. Download all chunks and concatenate
        log('  Downloading chunks...')
        const rawPath = join(jobDir, 'raw.img')
        const chunks = []

        for (let i = 0; i < manifest.totalChunks; i++) {
            const chunkKey = `raw/${scanId}/chunk-${i}.bin`
            const chunkBuf = await apiPost('r2_get', { key: chunkKey })
            chunks.push(Buffer.from(chunkBuf))

            if ((i + 1) % 10 === 0 || i === manifest.totalChunks - 1) {
                log(`  Downloaded chunk ${i + 1}/${manifest.totalChunks}`)
            }
        }

        const rawBuffer = Buffer.concat(chunks)
        log(`  Total raw data: ${formatBytes(rawBuffer.length)}`)

        // Free chunk references
        chunks.length = 0

        // 5. Carve files
        log('  Carving files...')
        const carvedFiles = carveFiles(rawBuffer)
        log(`  Found ${carvedFiles.length} files`)

        if (carvedFiles.length === 0) {
            await d1Query(
                `UPDATE carve_jobs SET status = 'completed', updated_at = ? WHERE id = ?`,
                [Date.now(), jobId]
            )
            await d1Query(
                `UPDATE scans SET status = 'completed' WHERE id = ?`,
                [scanId]
            )
            log('  No recoverable files found. Job complete.')
            return
        }

        // 6. Get the user ID from the scan
        const scanRows = await d1Query(
            `SELECT user_id FROM scans WHERE id = ?`,
            [scanId]
        )
        const userId = scanRows[0]?.user_id
        if (!userId) throw new Error(`No user found for scan ${scanId}`)

        // 7. Upload recovered files to R2 and insert into vault_files
        log('  Uploading recovered files...')
        for (const file of carvedFiles) {
            const r2Key = `restored/${scanId}/${file.fileName}`

            await apiPut(r2Key, file.data, file.fileType)

            const fileId = crypto.randomUUID()
            await d1Query(
                `INSERT INTO vault_files (id, user_id, scan_id, file_name, file_type, size_bytes, r2_key, start_offset, end_offset, sha256, confidence, integrity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [fileId, userId, scanId, file.fileName, file.fileType, file.sizeBytes, r2Key, file.startOffset, file.endOffset, file.sha256, file.confidence, file.integrity, Date.now()]
            )

            log(`  Uploaded: ${file.fileName} → ${r2Key}`)
        }

        // 8. Mark job complete
        await d1Query(
            `UPDATE carve_jobs SET status = 'completed', updated_at = ? WHERE id = ?`,
            [Date.now(), jobId]
        )
        await d1Query(
            `UPDATE scans SET status = 'completed' WHERE id = ?`,
            [scanId]
        )

        log(`\n  ✅ Job complete. ${carvedFiles.length} files recovered.`)

    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        log(`  ❌ Job failed: ${errMsg}`)

        try {
            await d1Query(
                `UPDATE carve_jobs SET status = 'failed', error = ?, updated_at = ? WHERE id = ?`,
                [errMsg, Date.now(), jobId]
            )
        } catch (updateErr) {
            log(`  Failed to update job status: ${updateErr}`)
        }
    } finally {
        // Cleanup work directory
        try {
            await rm(jobDir, { recursive: true, force: true })
        } catch { /* ignore */ }
    }
}

// ─── Poll Loop ─────────────────────────────────────────────────

async function poll() {
    try {
        const jobs = await d1Query(
            `SELECT id, scan_id FROM carve_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
        )

        if (jobs.length === 0) {
            return false
        }

        if (DRY_RUN) {
            log(`[DRY RUN] Found pending job: ${jobs[0].id} for scan ${jobs[0].scan_id}`)
            return false
        }

        await processJob(jobs[0])
        return true

    } catch (err) {
        log(`Poll error: ${err instanceof Error ? err.message : err}`)
        return false
    }
}

async function main() {
    log('═══════════════════════════════════════════════════════════')
    log('  restoreit Carve Worker')
    log('═══════════════════════════════════════════════════════════')
    log(`  API:       ${API_URL}`)
    log(`  Work dir:  ${WORK_DIR}`)
    log(`  Poll:      ${POLL_MS}ms`)
    log(`  Dry run:   ${DRY_RUN}`)
    log('')

    // Ensure work directory exists
    await mkdir(WORK_DIR, { recursive: true })

    // Test API connection
    log('Testing API connection...')
    try {
        const result = await d1Query(`SELECT COUNT(*) as count FROM carve_jobs WHERE status = 'pending'`)
        log(`Connected. ${result[0]?.count || 0} pending jobs.`)
    } catch (err) {
        log(`API connection failed: ${err.message}`)
        if (DRY_RUN) {
            log('[DRY RUN] Exiting.')
            process.exit(0)
        }
        log('Will retry on next poll...')
    }

    if (DRY_RUN) {
        await poll()
        log('[DRY RUN] Done.')
        process.exit(0)
    }

    log(`\nPolling for jobs every ${POLL_MS / 1000}s...\n`)

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const hadWork = await poll()
        if (!hadWork) {
            await sleep(POLL_MS)
        }
        // If we had work, immediately check for more
    }
}

// ─── Utilities ─────────────────────────────────────────────────

function log(msg) {
    const ts = new Date().toISOString().slice(11, 19)
    console.log(`[${ts}] ${msg}`)
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Start ─────────────────────────────────────────────────────

main().catch(err => {
    console.error('FATAL:', err)
    process.exit(1)
})
