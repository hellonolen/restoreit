// File Carving Engine — signature scan + extraction + integrity scoring

import { fileTypeFromBuffer } from 'file-type'
import { matchSignature, findFooter, type FileSignature } from './signatures.js'
import { getObject, putObject, listObjects } from './r2-client.js'
import { insertCloudFile, updateScanFilesFound } from './d1-client.js'
import { classifyFragment } from './ai-classifier.js'

const OVERLAP_SIZE = 4096 // 4KB overlap between chunks for boundary signatures
const MAX_CARVE_SIZE = 500 * 1024 * 1024 // 500MB max single file

export interface CarveResult {
  filesFound: number
  totalSize: number
  breakdown: Record<string, number>
  integrity: { intact: number; partial: number; corrupt: number }
}

interface DetectedFile {
  signature: FileSignature
  globalOffset: number       // Byte offset in the full raw data
  chunkIndex: number         // Which chunk contains the start
  localOffset: number        // Offset within that chunk
}

/**
 * Main carving pipeline for a scan.
 * Processes all chunks from R2, detects file signatures,
 * extracts contiguous files, scores integrity.
 */
export async function carve(scanId: string, userId: string): Promise<CarveResult> {
  console.log(`[carve] Starting carve for scan ${scanId}`)

  // Step 0: List available chunks
  const chunkKeys = await listObjects(`raw/${scanId}/`)
  const sortedKeys = chunkKeys
    .filter(k => k.endsWith('.bin'))
    .sort((a, b) => {
      const indexA = parseInt(a.match(/chunk-(\d+)/)?.[1] ?? '0')
      const indexB = parseInt(b.match(/chunk-(\d+)/)?.[1] ?? '0')
      return indexA - indexB
    })

  if (sortedKeys.length === 0) {
    console.log(`[carve] No chunks found for scan ${scanId}`)
    return { filesFound: 0, totalSize: 0, breakdown: {}, integrity: { intact: 0, partial: 0, corrupt: 0 } }
  }

  console.log(`[carve] Found ${sortedKeys.length} chunks`)

  // Step 1: Signature scan with streaming window + overlap
  const detectedFiles: DetectedFile[] = []
  let previousOverlap: Uint8Array | null = null
  let globalByteOffset = 0

  for (let chunkIdx = 0; chunkIdx < sortedKeys.length; chunkIdx++) {
    const chunkData = await getObject(sortedKeys[chunkIdx])
    if (!chunkData) {
      console.log(`[carve] Chunk ${chunkIdx} not found, skipping`)
      globalByteOffset += 16 * 1024 * 1024 // Assume standard chunk size
      continue
    }

    // Build scan buffer: overlap from previous chunk + current chunk
    let scanBuffer: Uint8Array
    if (previousOverlap) {
      scanBuffer = new Uint8Array(previousOverlap.length + chunkData.length)
      scanBuffer.set(previousOverlap, 0)
      scanBuffer.set(chunkData, previousOverlap.length)
    } else {
      scanBuffer = chunkData
    }

    const overlapOffset = previousOverlap ? previousOverlap.length : 0

    // Scan every byte for file signatures
    for (let pos = 0; pos < scanBuffer.length; pos++) {
      const sig = matchSignature(scanBuffer, pos)
      if (!sig) continue

      // Calculate global offset
      const localPos = pos - overlapOffset
      if (localPos < 0) continue // Already found in previous chunk's scan

      detectedFiles.push({
        signature: sig,
        globalOffset: globalByteOffset + localPos,
        chunkIndex: chunkIdx,
        localOffset: localPos,
      })
    }

    // Save overlap for next iteration
    if (chunkData.length >= OVERLAP_SIZE) {
      previousOverlap = chunkData.slice(chunkData.length - OVERLAP_SIZE)
    } else {
      previousOverlap = chunkData
    }

    globalByteOffset += chunkData.length
  }

  console.log(`[carve] Detected ${detectedFiles.length} potential file headers`)

  // Step 2 + 3: Contiguous extraction with format-aware termination
  const result: CarveResult = {
    filesFound: 0,
    totalSize: 0,
    breakdown: {},
    integrity: { intact: 0, partial: 0, corrupt: 0 },
  }

  for (const detected of detectedFiles) {
    try {
      const carved = await extractFile(detected, sortedKeys, scanId, userId)
      if (carved) {
        result.filesFound++
        result.totalSize += carved.sizeBytes
        result.breakdown[carved.category] = (result.breakdown[carved.category] || 0) + 1
        result.integrity[carved.integrity as keyof typeof result.integrity]++
      }
    } catch (err) {
      console.error(`[carve] Error extracting file at offset ${detected.globalOffset}:`, err)
    }
  }

  // Update scan record with final counts
  await updateScanFilesFound(scanId, result.filesFound, result.totalSize)

  console.log(`[carve] Complete. ${result.filesFound} files carved, ${formatBytes(result.totalSize)}`)
  return result
}

/**
 * Extract a single file from raw chunks based on detected header.
 */
async function extractFile(
  detected: DetectedFile,
  chunkKeys: string[],
  scanId: string,
  userId: string,
): Promise<{ sizeBytes: number; category: string; integrity: string } | null> {
  const sig = detected.signature
  const startChunk = detected.chunkIndex
  const startOffset = detected.localOffset

  // Read enough data to find the file end
  // Start with the chunk containing the header
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  const maxBytes = Math.min(sig.maxSize ?? MAX_CARVE_SIZE, MAX_CARVE_SIZE)

  for (let i = startChunk; i < chunkKeys.length && totalBytes < maxBytes; i++) {
    const data = await getObject(chunkKeys[i])
    if (!data) break
    chunks.push(data)
    totalBytes += data.length
  }

  if (chunks.length === 0) return null

  // Concatenate relevant data
  const fullBuffer = concatenateChunks(chunks, startOffset)
  if (fullBuffer.length < sig.header.length) return null

  // Find file end
  let fileEnd: number
  let integrity: 'intact' | 'partial' | 'corrupt'

  if (sig.footer) {
    // Search for footer
    const footerPos = findFooter(fullBuffer, sig.header.length, sig.footer, maxBytes)
    if (footerPos > 0) {
      fileEnd = footerPos
      integrity = 'intact'
    } else {
      // No footer found — try using file-type to estimate
      fileEnd = Math.min(fullBuffer.length, maxBytes)
      integrity = 'partial'
    }
  } else {
    // No known footer — use file-type detection + max size heuristic
    fileEnd = Math.min(fullBuffer.length, maxBytes)
    integrity = 'partial'
  }

  // Extract the file bytes
  const fileBytes = fullBuffer.slice(0, fileEnd)
  if (fileBytes.length < 16) return null // Too small to be a real file

  // Step 4: Validate with file-type library
  let detectedType = sig.extension
  let confidence = integrity === 'intact' ? 95 : 60

  try {
    const ftResult = await fileTypeFromBuffer(fileBytes)
    if (ftResult) {
      detectedType = ftResult.ext
      confidence = integrity === 'intact' ? 98 : 75
    }
  } catch {
    // file-type couldn't parse — keep signature-based detection
  }

  // Step 5: Optional AI classification for ambiguous results
  if (confidence < 60 && fileBytes.length >= 64) {
    try {
      const aiResult = await classifyFragment(fileBytes.slice(0, 256))
      if (aiResult && aiResult.confidence > confidence) {
        detectedType = aiResult.extension
        confidence = aiResult.confidence
      }
    } catch {
      // AI classification failed — use existing detection
    }
  }

  // Compute SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes)
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Store in RestoreIt Cloud (R2)
  const fileId = crypto.randomUUID()
  const r2Key = `cloud/${scanId}/${fileId}.${detectedType}`
  await putObject(r2Key, fileBytes, getMimeType(detectedType))

  // Insert cloud file record
  await insertCloudFile({
    id: fileId,
    userId,
    scanId,
    fileName: `recovered-${fileId.slice(0, 8)}.${detectedType}`,
    fileType: detectedType,
    sizeBytes: fileBytes.length,
    r2Key,
    startOffset: detected.globalOffset,
    endOffset: detected.globalOffset + fileBytes.length,
    sha256,
    confidence,
    integrity,
  })

  return {
    sizeBytes: fileBytes.length,
    category: sig.category,
    integrity,
  }
}

/**
 * Concatenate chunk arrays starting from an offset in the first chunk.
 */
function concatenateChunks(chunks: Uint8Array[], startOffset: number): Uint8Array {
  let totalLength = -startOffset
  for (const chunk of chunks) totalLength += chunk.length

  const result = new Uint8Array(Math.max(0, totalLength))
  let writePos = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const readStart = i === 0 ? startOffset : 0
    const bytes = chunk.slice(readStart)
    result.set(bytes, writePos)
    writePos += bytes.length
  }

  return result
}

function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    bmp: 'image/bmp', tif: 'image/tiff', webp: 'image/webp', heic: 'image/heic',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mp4: 'video/mp4', avi: 'video/x-msvideo', mkv: 'video/x-matroska', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg',
    zip: 'application/zip', rar: 'application/x-rar-compressed', '7z': 'application/x-7z-compressed',
    gz: 'application/gzip',
  }
  return mimeMap[ext] ?? 'application/octet-stream'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
