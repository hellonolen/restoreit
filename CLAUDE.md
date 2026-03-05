# restoreit — Project Reference

## ⚠️ SECURITY: Secret Management (MANDATORY)

**NEVER put secrets, API keys, tokens, or credentials in `.env` files. EVER.**

This is a zero-tolerance policy. Violations are unacceptable.

### Where secrets go:
- **Cloudflare Workers secrets** → `wrangler secret put SECRET_NAME`
- **System-level env vars** → systemd `Environment=`, pm2 config, Docker `-e`
- **Cloudflare dashboard** → Settings → Variables → Encrypt

### What CAN go in `.env` or `.env.example`:
- Public URLs (e.g., `RESTOREIT_API_URL=https://restoreit.app`)
- Non-secret config (e.g., `WORK_DIR=/tmp/restoreit-carve`)
- Poll intervals, feature flags, and other non-sensitive values
- Placeholder comments showing WHERE to set secrets, never actual values

### What CANNOT go in `.env` files:
- API keys
- Secret tokens
- Database credentials
- Internal API secrets
- Any value that grants access to anything

### If you need to reference a secret:
```env
# ✅ CORRECT — tells the user where to set it
# Set INTERNAL_API_SECRET via: wrangler secret put INTERNAL_API_SECRET

# ❌ WRONG — actual secret value in a file
INTERNAL_API_SECRET=abc123...
```

---

## Branding
- Always lowercase: `restoreit` (never "RestoreIt", "RESTOREIT", or "Restore It")
- Domain: `restoreit.app` (with `restoreit.ai` redirecting to it)

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Deployment:** Cloudflare Workers via OpenNext
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage:** Cloudflare R2 (`restoreit-vaults` bucket)
- **Payments:** Whop (not Stripe)
- **AI Engine:** Google Gemini (via `GOOGLE_GENAI_API_KEY`)
- **VPS Worker:** Node.js carve worker (`vps/carve-worker.mjs`)

## Architecture
```
User Drive → Relay Script (bash, memory-only)
  → /api/ingest (chunks to R2)
  → /api/scan/finalize (creates carve_job)
  → VPS Carve Worker (polls, carves files, uploads to R2)
  → /api/download/presign (paywall + presigned R2 URL)
```

The VPS communicates with Cloudflare via `/api/internal` (proxies D1 + R2, auth via `INTERNAL_API_SECRET`).
