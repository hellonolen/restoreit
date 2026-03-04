// AI Fragment Classifier — uses Gemini to identify ambiguous/corrupted file fragments

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY ?? ''

interface ClassificationResult {
  extension: string
  fileType: string
  confidence: number // 0-100
  corrupted: boolean
  notes: string
}

/**
 * Send a hex dump of the first N bytes to Gemini for classification.
 * Only used for fragments where signature-based detection failed or is ambiguous.
 */
export async function classifyFragment(bytes: Uint8Array): Promise<ClassificationResult | null> {
  if (!GEMINI_API_KEY) {
    console.log('[ai-classifier] No API key configured, skipping AI classification')
    return null
  }

  // Build hex dump
  const hexLines: string[] = []
  for (let i = 0; i < bytes.length; i += 16) {
    const hex = Array.from(bytes.slice(i, i + 16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
    const ascii = Array.from(bytes.slice(i, i + 16))
      .map(b => (b >= 0x20 && b <= 0x7E) ? String.fromCharCode(b) : '.')
      .join('')
    hexLines.push(`${i.toString(16).padStart(8, '0')}  ${hex.padEnd(48)}  ${ascii}`)
  }

  const hexDump = hexLines.join('\n')

  const prompt = `You are a forensic file analysis expert. Analyze this hex dump from the beginning of a file fragment found during disk recovery.

Hex dump (first ${bytes.length} bytes):
\`\`\`
${hexDump}
\`\`\`

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "extension": "the most likely file extension (e.g. jpg, pdf, docx)",
  "fileType": "human readable file type name",
  "confidence": 0-100,
  "corrupted": true/false,
  "notes": "brief explanation of your reasoning"
}

If you cannot determine the file type, set confidence to 0.`

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult
    if (typeof parsed.confidence !== 'number' || typeof parsed.extension !== 'string') {
      return null
    }

    return parsed
  } catch (err) {
    console.error('[ai-classifier] Classification failed:', err)
    return null
  }
}
