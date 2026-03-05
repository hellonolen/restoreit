# restoreit — Master PRD (Revenue-Optimized)

Status: V4 — Cloud Forensics Platform (March 2026)
Target: $50,000+ Monthly Revenue

---

## 1. Product Vision

restoreit (restoreit.app) is an ultra-premium cloud recovery platform designed to rescue permanently deleted files for non-technical users experiencing data loss emergencies.

When people lose files they are in panic mode. Existing recovery tools are complicated, slow, and destructive because they require installation onto the same disk that lost the data.

restoreit solves this by:
• Preventing destructive installs
• Streaming raw disk data safely to the cloud via a memory-only relay
• Reconstructing files autonomously using restoreit's forensic carving engine
• Providing a calm, guided recovery experience
• Delivering all recovered files securely via restoreit Cloud (never to the user's local drive)

restoreit functions as a Diagnostic Concierge that guides the user step-by-step through recovery while the heavy computation occurs securely in the cloud.

The platform is optimized for:
• Simplicity
• Speed
• High emotional value recovery moments
• Premium pricing

The goal is maximum trust during a crisis.

---

## 2. Revenue Objective

restoreit is designed to produce $50,000+ monthly recurring revenue with low operational overhead.

**Core revenue model:**
• Standard Tier — $89
• Pro Tier — $249
• Cloud Storage Add-on — $79 (always offered at checkout)

**Expected conversion mix:**
• Standard: 70%
• Pro: 30%
• Cloud Storage add-on: ~40% attach rate

**Estimated blended revenue per user ≈ $168**

**Revenue model:**
350 Standard users × $89 = $31,150
150 Pro users × $249 = $37,350
200 Cloud Storage add-ons × $79 = $15,800
Estimated monthly revenue: $84,300

Target monthly users: ~500 recoveries.

**Recurring revenue layer:**
• restoreit Protection — $29/month (post-recovery subscription)
• 500 recoveries/month × 20% conversion = 100 subscribers ($2,900 MRR building monthly)

---

## 3. Target User

restoreit is designed for non-technical users experiencing sudden data loss.

**Common scenarios:**
• Deleted family photos
• Lost business documents
• Corrupted SD cards / Formatted external drives
• Accidentally deleted folders
• Camera storage failures / Laptop drive corruption

**These users value:**
• Speed
• Clear guidance
• Low complexity
• Emotional reassurance

---

## 4. Core Architectural Principles

restoreit is built around three architectural principles:
1. **Zero-install disk safety:** Never write to the corrupted drive.
2. **Cloud-based reconstruction:** Offload heavy processing to Cloudflare & VPS carve workers.
3. **Cloud-only delivery:** All recovered files are stored and accessed via restoreit Cloud. restoreit does not download files to users' local drives.
4. **Simple crisis-oriented user experience:** Hide the tech stack entirely from the front-end. No mention of AI, Cloudflare, or internal tooling on the UI.

---

## 5. Zero-Install Recovery (Relay Pipe)

**Problem:** Traditional recovery software requires installing a program onto the affected disk, which overwrites the very files being recovered.

**Solution:** restoreit separates computation from disk access. A tiny, memory-only relay streams disk sectors directly to the restoreit cloud. The relay performs no analysis and writes nothing to the disk.

**Relay characteristics:**
• Execution: Terminal command (e.g., `curl restoreit.app/relay | bash`)
• Disk Writes: None
• Runtime: Memory only
• Transport: Encrypted HTTPS streaming with SHA-256 chunk verification

---

## 6. Cloud Reconstruction Engine

restoreit Cloud receives the raw byte stream and reconstructs recoverable files using a forensic carving engine.

**Cloud responsibilities:**
• File signature detection (magic number / header detection)
• Fragment identification and stitching
• Structural reconstruction (entropy scanning)
• Binary carving (JPEG, PDF, DOCX, PNG, MP4, and more)

**Processing pipeline:**
```
Raw chunks in R2 → Carve worker claims job → Downloads manifest + chunks
  → Reassembles raw binary → Scans for file signatures
  → Extracts files → Uploads to R2 → Registers in D1 vault_files
  → Sets scan status to 'ready'
```

---

## 7. The "Proof of Life" Conversion Mechanic

To maximize conversion, we employ a **"Proof of Life" paywall strategy**.
Users must physically *see* that their files exist before paying. The engine extracts recovered file previews (thumbnails, document excerpts) and displays them in the dashboard to prove the recovery was successful.

*Rule: We charge only when recovery is detected and proven.*

---

## 8. Recovery Flow

**Step 1 — Entry:** User arrives at restoreit.app. Landing page explains zero-install recovery.
**Step 2 — Diagnostic:** restoreit gathers minimal context (OS, disk type, data loss scenario).
**Step 3 — Relay Launch:** User launches the restoreit relay. The relay begins streaming raw disk sectors.
**Step 4 — Cloud Forensics:** Carve engine analyzes sectors. Dashboard displays detected file fragments and previews ("Proof of Life").
**Step 5 — Recovery Gate:** User selects a recovery tier. Recovered files become accessible in restoreit Cloud.

---

## 9. Pricing Model

restoreit uses value-based crisis pricing. Users pay only after files are detected.

**Standard Tier — $89**
• Full cloud reconstruction
• Recovered files via secure link
• 48-hour cloud retention

**Pro Tier — $249**
• Full cloud reconstruction
• Private Cloud Vault (Cloudflare R2)
• 7-day cloud retention
• Priority processing queue

**Cloud Storage Add-on — $79**
• 500GB encrypted cloud storage
• Long-term retention
• Access from any device
• Always offered at checkout alongside any plan

**restoreit Protection — $29/month** (post-recovery subscription)
• Disk health monitoring
• Corruption detection alerts
• Priority recovery queue
• Extended 30-day cloud retention
• Offered only after successful recovery

---

## 10. System Architecture (Internal)

**Frontend**
• Framework: Next.js 16 (App Router, Tailwind CSS)
• Deployment: Cloudflare Workers via OpenNext
• UI Rule: No mention of AI, Cloudflare, Agents, or Infrastructure on user-facing pages

**Backend**
• Database: Cloudflare D1 (SQLite) with Drizzle ORM
• Object Storage: Cloudflare R2 (`restoreit-vaults` bucket)
• Internal API: `/api/internal/*` (proxies D1 + R2 for VPS, auth via `INTERNAL_API_SECRET`)

**Carve Worker**
• Runtime: Node.js v18+ on VPS
• Service: systemd (`restoreit-carve.service`)
• Polling: Every 30 seconds for pending carve jobs
• Processing: Binary signature detection, file extraction, R2 upload, D1 registration

**Payments**
• Provider: Whop Checkout
• Trigger: After file detection ("Proof of Life" gate)

**Relay Layer**
• Implementation: Bash script (memory-only streaming)
• Transport: HTTPS with SHA-256 chunk verification

---

## 11. File Delivery Model — Cloud Only

**restoreit does NOT download files to users' local drives.**

All recovered files are stored in restoreit Cloud (Cloudflare R2) and accessed via:
• Presigned secure download URLs (time-limited)
• restoreit Cloud dashboard (for Cloud Storage subscribers)

**Retention windows:**
• Standard tier: 48 hours
• Pro tier: 7 days
• Protection subscribers: 30 days
• Cloud Storage: persistent (until cancelled)

This is consistent across all pages: checkout, pricing, support FAQ, and terms.

---

## 12. Security & Privacy

• **Encryption in transit:** TLS 1.3 for all data transmission
• **Encryption at rest:** AES-256 for all stored data in R2
• **Zero-access principle:** restoreit does not index or access file content beyond reconstruction
• **Automatic purge:** Data is automatically deleted after retention windows
• **Secret management:** All secrets stored in Cloudflare Workers secrets and systemd environment — never in `.env` files, source code, or chat logs
• **GDPR compliant:** Right to deletion requests honored within 30 days

---

## 13. Marketing Positioning

**Primary message:** Recover deleted files without installing recovery software.
**Core themes:** See more. Recover faster. Restore smarter.
**Hero copy:** "What most people do after losing a file makes things worse."

---

## 14. Partner Program (Restore-as-a-Service)

Repair shops and IT service providers can integrate restoreit as a recovery service for their customers.

**Partner tiers:**
• Starter — Low-volume shops
• Growth — Multi-location operations
• Enterprise — Custom volume agreements

**Partner value:** Upload disk images via API, preview files, deliver restores. No installs on customer hardware.

---

## 15. Implementation Status (March 2026)

| Component | Status |
|-----------|--------|
| Frontend (Next.js 16) | ✅ Live |
| Auth (signup/login) | ✅ Live |
| Relay → Ingest pipeline | ✅ Live (SHA-256 verified) |
| Scan finalize → Carve job | ✅ Live |
| Carve worker (VPS) | ✅ Deployed (systemd, polling) |
| File carving (JPEG, PDF) | ✅ Verified |
| R2 upload + D1 registration | ✅ Verified |
| Checkout (Whop) | ✅ Live |
| $79 Cloud Storage add-on | ✅ Live |
| Presigned download (paywall) | ✅ Live |
| Partner pages (RaaS) | ✅ Live |
| Blog (SEO) | ✅ Live |
| Support / FAQ | ✅ Live |
| Terms / Privacy / Disclaimers | ✅ Live |

**E2E Pipeline Test (March 5, 2026):**
All steps pass: Signup (201) → Scan Create (200) → Ingest with SHA-256 (200) → Finalize with carve_job (200) → Carve worker extracts files from raw binary → R2 upload → D1 registration → Scan set to 'ready'.

---

## 16. Product Expansion & Feature Backlog

### User Experience
• Pre-scan volume information (estimated scan time based on drive size)
• Pause/resume functionality for deep scans
• Scan history log
• Quick scan vs. deep scan options
• File preview before recovery
• Selective recovery (specific files/folders)
• Search and filter recovered files
• Duplicate detection

### Progress & Feedback
• Real-time progress indicators (percentage, files found, time remaining)
• Network status indicator during relay
• Bandwidth usage display
• Recovery success rate display

### Error Handling
• Disconnection recovery (handle network interruptions gracefully)
• Corrupted file handling (flag partially recoverable files)
• Drive disconnection during scan
• Timeout handling

### Security & Privacy
• Two-factor authentication
• Audit logs
• Secure deletion verification

### File Type Support
• JPEG, PNG, PDF, DOCX, MP4, MOV, RAW (current + planned)
• Metadata preservation (timestamps, EXIF data)
• Partition table recovery
• Encrypted volume support (FileVault, BitLocker)
• File system support: APFS, HFS+, NTFS, exFAT, ext4

### Business & Growth
• Referral program
• Family/team plans
• Enterprise API access
• A/B testing framework

---

## 17. Branding Rules

• Always lowercase: **restoreit** — never "RestoreIt", "RESTOREIT", or "Restore It"
• Domain: restoreit.app (restoreit.ai redirects)
• Cloud-only language: Never say "download to your drive" — always "restoreit Cloud", "secure link", "cloud access"
• No exposed infrastructure: Never mention Cloudflare, D1, R2, Workers, or VPS in user-facing copy

---

*Status: V4 — Revenue-Optimized Cloud Forensics Platform (March 2026)*
