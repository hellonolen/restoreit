# RestoreIt: Partner Acquisition Outbound Engine

**Objective:** Automate the acquisition of B2B partners for the RestoreIt Partner Program (RaaS).
**Scale Target:** 10,000 processed leads per week.
**Orchestration Engine:** 100% Cloudflare Worker (`outbound-worker`)
**Database:** Cloudflare D1
**Intelligence:** Google Gemini 1.5 Pro (via AI Gateway API)
**Delivery:** Google Workspace Accounts (REST API isolated on `mail.restoreit.app`)

---

## 1. Why Native Cloudflare?
You already have a massive Cloudflare ecosystem. Forcing you to rent a VPS, sign up for third-party scraping APIs (Apify, Hunter), and manually manage `.env` files is unnecessary friction. 

By building the `outbound-worker` natively in Cloudflare Workers using CRON triggers:
1. **Zero Dev-Ops:** You don't spin up servers or maintain PM2/Node.js daemons.
2. **Infinite Scale:** Cloudflare automatically scales the CRON executions.
3. **Unified Secrets:** Your API keys stay natively inside Cloudflare Workers Secrets.
4. **Native Database:** Everything writes directly to your central Cloudflare D1 database. No local SQLite files moving around.

---

## 2. Infrastructure & Domain Strategy
To protect the core business, we **never** send cold outbound from the root domain (`restoreit.app`). We strictly isolate reputation risk using subdomains.

| Purpose | Domain/Subdomain |
|---------|------------------|
| Website / Product | `restoreit.app` |
| Cold Outbound | `mail.restoreit.app` (e.g., `david@mail.restoreit.app`) |
| System Notifications | `notify.restoreit.app` (via **EmailIt** for fast transactional delivery) |
| Tracking Links | `trk.restoreit.app` |

*If the outbound reputation drops due to spam reports, the main product and customer transactional emails remain completely unaffected.*

---

## 3. High-Level Architecture (Cloudflare CRON Engine)
The engine is a single Cloudflare Worker (`/workers/outbound-worker/`) running continuously using `wrangler.toml` CRON schedules.

It uses a D1 database (`restoreit_outbound`) to track state natively.

The daemon runs **4 concurrent asynchronous loops**:

### Loop 1: The Scout (Native Google Places API)
*Runs: Once a week (`0 0 * * 0`)*
- Instead of paying Apify, the Cloudflare Worker hits the official Google Places REST API (`textsearch`).
- Queries for things like "Computer repair in Texas".
- Parses the JSON response and runs `INSERT OR IGNORE` into the `leads` table (ignoring duplicate websites).
- Sets `status = 'new'`.

### Loop 2: The Enricher (Native Scraping)
*Runs: Every 15 minutes (`*/15 * * * *`)*
- Queries: `SELECT * FROM leads WHERE status = 'new' AND email IS NULL LIMIT 50`
- Instead of paying Hunter.io, the Cloudflare Worker issues a direct `fetch()` to the lead's website and uses Regex to natively extract explicit `mailto:` schemas or visible email addresses on their contact pages.
- Updates the database: Sets the email, moves `status = 'enriched'`.

### Loop 3: The Copywriter (Gemini via AI Gateway)
*Runs: Every 5 minutes (`*/5 * * * *`)*
- Queries: `SELECT * FROM leads WHERE status = 'enriched' LIMIT 20`
- Fetches the prospect's actual website HTML using `fetch()`.
- Strips the HTML to raw text.
- Calls `gemini-1.5-pro` using Cloudflare AI Gateway (for caching and analytics).
- Saves the generated `subject` and `body` back to the database. Sets `status = 'ready_to_send'`.

### Loop 4: The Postman (Google Gmail API)
*Runs: Every 1 minute during working hours (`* 9-17 * * 1-5`)*
- Queries: `SELECT * FROM leads WHERE status = 'ready_to_send' LIMIT 1`
- Instead of using `nodemailer` (TCP limitations in V8 Isolates), the Worker connects directly to the official Google **Gmail REST API**.
- Authenticates using an OAuth2 Refresh Token stored securely in Cloudflare Secrets.
- Sends the email natively without a heavy Node dependency.
- Sets `status = 'sent'`.

## 4. Database Schema (`leads.sqlite`)
```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  business_name TEXT,
  website TEXT UNIQUE,
  email TEXT,
  city TEXT,
  phone TEXT,
  rating REAL,
  status TEXT DEFAULT 'new', -- new, enriched, ready_to_send, sent, active_lead, dead, dnc
  generated_subject TEXT,
  generated_body TEXT,
  last_contacted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Setting It Up Together (Zero Setup)
1. We construct a single Cloudflare Worker using `wrangler.toml` pointing directly to your D1.
2. We inject exactly two keys into your Cloudflare Dashboard Secrets: `GEMINI_API_KEY` and `GCP_PLACES_KEY`.
3. We run `npm run deploy`—and the worker lives in the cloud forever, requiring zero VPS configuration or `.env` files.
