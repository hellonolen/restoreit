# restoreit

**Cloud-based forensic file restoration that never writes to your drive.**

[restoreit.app](https://restoreit.app)

---

## What It Does

restoreit recovers permanently deleted files for non-technical users experiencing data loss emergencies. Unlike traditional recovery software that requires installation onto the affected disk (risking further data loss), restoreit uses a zero-install, memory-only relay to stream raw disk data to a cloud forensics engine for reconstruction.

**The problem restoreit solves:** Every recovery tool on the market requires you to install software onto the same drive you're trying to recover. That installation writes new data to the disk — potentially overwriting the very files you're trying to save.

**The restoreit difference:** Nothing is written to the affected drive. A lightweight relay script runs entirely in memory, streams raw sectors to the cloud, and restoreit's forensic engine reconstructs recoverable files without touching the original storage.

---

## How It Works

1. **Describe** — Tell us what happened and which drive to scan.
2. **Select** — Choose the drive. Run the relay command.
3. **Scan** — The relay streams raw sectors to restoreit's cloud engine.
4. **Preview** — See what the scan detected before you pay ("Proof of Life").
5. **Unlock** — Choose a plan. Access your restored files securely in restoreit Cloud.

---

## Architecture

```
User Drive → Relay Script (bash, memory-only, zero disk writes)
  → /api/ingest (chunks uploaded to Cloudflare R2 with SHA-256 verification)
  → /api/scan/finalize (creates carve job)
  → VPS Carve Worker (polls for jobs, carves files from raw binary, uploads results to R2)
  → /api/download/presign (paywalled presigned R2 download URLs)
```

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Deployment | Cloudflare Workers via OpenNext |
| Database | Cloudflare D1 (SQLite) with Drizzle ORM |
| Object Storage | Cloudflare R2 (`restoreit-vaults` bucket) |
| Payments | Whop |
| Carve Worker | Node.js (systemd on VPS) |
| Domain | restoreit.app (restoreit.ai redirects) |

### Key Design Principles

- **Zero-install disk safety** — Never write to the corrupted drive
- **Cloud-based reconstruction** — All heavy processing happens in the cloud
- **Crisis-oriented UX** — Hide the tech stack from the user; calm, guided experience
- **Proof of Life** — Users see recovered file previews before paying
- **Cloud-only delivery** — All restored files are stored and accessed via restoreit Cloud

---

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| restoreit | $89 | Cloud restoration scan, recovered files via secure link |
| restoreit Pro | $249 | Deep scan, file reconstruction, extended Cloud retention |
| Cloud Storage Add-on | $79 | 500GB encrypted cloud storage for restored files |
| restoreit Protection | $29/mo | Post-recovery monitoring, priority queue, extended retention |

**Payment model:** Users pay only after files are detected ("Proof of Life" gate). If no files are found, no charge is applied.

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/pricing` | Plan comparison |
| `/restore` | Scan intake |
| `/checkout` | Plan selection + Whop payment |
| `/how-it-works` | Step-by-step explainer |
| `/partners` | Restore-as-a-Service (RaaS) for repair shops |
| `/blog` | SEO content |
| `/support` | FAQ |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/account` | User dashboard |

---

## Security

- All data encrypted in transit (TLS 1.3) and at rest (AES-256)
- Zero-access principle — restoreit does not index or access file content beyond reconstruction
- Automatic data purge after retention windows
- Secrets stored exclusively in Cloudflare Workers secrets and systemd environment — never in `.env` files

---

## Branding

- Always lowercase: **restoreit** (never "RestoreIt", "RESTOREIT", or "Restore It")
- Domain: restoreit.app
- Cloud-only: restoreit does not download to users' local drives — all files are accessed via restoreit Cloud

---

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for Cloudflare
npm run build:cf

# Deploy
npm run deploy
```

---

## Partner Program (RaaS)

Repair shops and IT service providers can use restoreit as a white-label recovery service. See [/partners](https://restoreit.app/partners) and [/docs/raas](https://restoreit.app/docs/raas) for integration details.

---

© restoreit — [restoreit.app](https://restoreit.app)
