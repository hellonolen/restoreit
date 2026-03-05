// GET /api/relay — Serve bash relay script


const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://restoreit.app'

function buildRelayScript(scanId: string): string {
  return `#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# restoreit Relay — reads raw bytes from a drive and uploads
# them to the restoreit cloud for file recovery.
#
# This script runs entirely in memory. It performs ZERO write
# operations on your drive.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCAN_ID="${scanId}"
BASE_URL="${BASE_URL}"
BLOCK_SIZE=$((16 * 1024 * 1024))  # 16MB chunks
DRIVE="\${1:-}"
TOKEN="\${RESTOREIT_TOKEN:-}"

# ─── Validation ───────────────────────────────────────────────

if [ -z "\$TOKEN" ]; then
  echo "Error: RESTOREIT_TOKEN environment variable is not set."
  echo "Usage: RESTOREIT_TOKEN=<your-token> bash <(curl -sL \\"$BASE_URL/api/relay?scan=$SCAN_ID\\") /path/to/drive"
  exit 1
fi

if [ -z "\$DRIVE" ]; then
  echo "Error: No drive path specified."
  echo "Usage: RESTOREIT_TOKEN=<your-token> bash <(curl -sL \\"$BASE_URL/api/relay?scan=$SCAN_ID\\") /dev/sdX"
  exit 1
fi

if [ ! -r "\$DRIVE" ]; then
  echo "Error: Cannot read '\$DRIVE'. Check path and permissions."
  echo ""
  echo "  macOS: System Settings > Privacy & Security > Full Disk Access > enable Terminal"
  echo "  Linux: sudo is required to read block devices"
  exit 1
fi

# ─── Drive info ───────────────────────────────────────────────

DRIVE_SIZE=0
if command -v blockdev &>/dev/null; then
  DRIVE_SIZE=\$(blockdev --getsize64 "\$DRIVE" 2>/dev/null || echo 0)
elif command -v stat &>/dev/null; then
  # macOS stat
  DRIVE_SIZE=\$(stat -f%z "\$DRIVE" 2>/dev/null || stat --format=%s "\$DRIVE" 2>/dev/null || echo 0)
fi

TOTAL_CHUNKS=0
if [ "\$DRIVE_SIZE" -gt 0 ]; then
  TOTAL_CHUNKS=$(( (DRIVE_SIZE + BLOCK_SIZE - 1) / BLOCK_SIZE ))
fi

echo "═══════════════════════════════════════════════════════════"
echo "  restoreit Relay"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Scan ID:    \$SCAN_ID"
echo "  Drive:      \$DRIVE"
if [ "\$DRIVE_SIZE" -gt 0 ]; then
  echo "  Drive size: \$(numfmt --to=iec \$DRIVE_SIZE 2>/dev/null || echo "\$DRIVE_SIZE bytes")"
  echo "  Chunks:     ~\$TOTAL_CHUNKS (at 16MB each)"
fi
echo "  Mode:       READ-ONLY (zero writes to your drive)"
echo ""
echo "  This will read raw bytes from your drive and upload"
echo "  them to the restoreit cloud for file recovery."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
read -p "  Type YES to proceed: " CONFIRM
echo ""

if [ "\$CONFIRM" != "YES" ]; then
  echo "Cancelled."
  exit 0
fi

# ─── Resume check ─────────────────────────────────────────────

echo "Checking for existing progress..."
STATUS_RESPONSE=\$(curl -sS "\$BASE_URL/api/scan/status?scan=\$SCAN_ID" \\
  -H "Cookie: restoreit_session=\$TOKEN" 2>/dev/null || echo '{}')

CHUNKS_RECEIVED=\$(echo "\$STATUS_RESPONSE" | grep -o '"chunksReceived":[0-9]*' | grep -o '[0-9]*' || echo "0")

if [ "\$CHUNKS_RECEIVED" -gt 0 ]; then
  echo "Resuming from chunk \$CHUNKS_RECEIVED..."
fi

# ─── Upload loop ──────────────────────────────────────────────

CHUNK=\$CHUNKS_RECEIVED
FAILED=0

while true; do
  # Read chunk with dd — raw bytes, no encoding
  BYTES_READ=\$(dd if="\$DRIVE" bs=\$BLOCK_SIZE skip=\$CHUNK count=1 2>/dev/null | wc -c)

  if [ "\$BYTES_READ" -eq 0 ]; then
    break
  fi

  # Compute SHA-256 and upload in one pass
  HASH=\$(dd if="\$DRIVE" bs=\$BLOCK_SIZE skip=\$CHUNK count=1 2>/dev/null | shasum -a 256 | cut -d' ' -f1)

  HTTP_CODE=\$(dd if="\$DRIVE" bs=\$BLOCK_SIZE skip=\$CHUNK count=1 2>/dev/null | \\
    curl -sS -o /dev/null -w "%{http_code}" -X POST "\$BASE_URL/api/ingest" \\
      -H "Authorization: Bearer \$TOKEN" \\
      -H "X-Scan-Id: \$SCAN_ID" \\
      -H "X-Chunk-Index: \$CHUNK" \\
      -H "X-Chunk-Sha256: \$HASH" \\
      -H "Content-Type: application/octet-stream" \\
      --data-binary @-)

  if [ "\$HTTP_CODE" = "200" ]; then
    CHUNK=\$((CHUNK + 1))
    if [ "\$TOTAL_CHUNKS" -gt 0 ]; then
      PCT=\$((CHUNK * 100 / TOTAL_CHUNKS))
      echo "  Chunk \$CHUNK/\$TOTAL_CHUNKS uploaded (\$PCT%)"
    else
      echo "  Chunk \$CHUNK uploaded"
    fi
    FAILED=0
  else
    FAILED=\$((FAILED + 1))
    echo "  Chunk \$CHUNK failed (HTTP \$HTTP_CODE) — retry \$FAILED/3"
    if [ "\$FAILED" -ge 3 ]; then
      echo "Error: Chunk \$CHUNK failed 3 times. Stopping."
      echo "Re-run this command to resume from chunk \$CHUNK."
      exit 1
    fi
  fi
done

# ─── Finalize ─────────────────────────────────────────────────

echo ""
echo "All chunks uploaded. Finalizing scan..."

curl -sS -X POST "\$BASE_URL/api/scan/finalize" \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "{\\"scanId\\":\\"\$SCAN_ID\\",\\"totalChunks\\":\$CHUNK}" >/dev/null

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Upload complete. \$CHUNK chunks transferred."
echo "  Return to restoreit.app to view your results."
echo "═══════════════════════════════════════════════════════════"
`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const scanId = url.searchParams.get('scan')

  if (!scanId) {
    return new Response('# Error: scan parameter is required\nexit 1\n', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // Validate scan ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(scanId)) {
    return new Response('# Error: invalid scan ID\nexit 1\n', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const script = buildRelayScript(scanId)

  return new Response(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
