import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata = {
  title: 'API Documentation — RestoreIt Restore-as-a-Service',
  description: 'REST API reference for RestoreIt RaaS. Create restore jobs, upload disk images, list recovered files, and download via presigned URLs.',
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-500/10 text-green-400 border-green-500/20',
    POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border ${colors[method] ?? 'bg-[var(--color-card-hover)] text-[var(--color-text-secondary)]'}`}>
      {method}
    </span>
  )
}

function CodeBlock({ label, children }: { label?: string; children: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
      {label && (
        <div className="px-5 py-2.5 border-b border-[var(--color-border)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
          {label}
        </div>
      )}
      <pre className="p-5 text-xs leading-relaxed overflow-x-auto" style={{ fontFamily: 'var(--font-mono), monospace' }}>
        <code className="text-[var(--color-accent)]">{children}</code>
      </pre>
    </div>
  )
}

function EndpointCard({ method, path, description, curl, response }: {
  method: string
  path: string
  description: string
  curl: string
  response: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodBadge method={method} />
          <code className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono), monospace' }}>{path}</code>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
      </div>
      <div className="border-t border-[var(--color-border)] p-6 md:p-8 space-y-4">
        <CodeBlock label="Request">{curl}</CodeBlock>
        <CodeBlock label="Response">{response}</CodeBlock>
      </div>
    </div>
  )
}

export default function RaasDocsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1 pt-28">
        {/* Hero */}
        <section className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
              API Reference
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              Restore-as-a-Service API
            </h1>
            <p className="text-lg text-[var(--color-text-tertiary)] max-w-xl leading-relaxed">
              Create restore jobs, upload disk images, and download recovered files programmatically.
            </p>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 inline-flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Base URL</span>
              <code className="text-sm text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>https://restoreit.app</code>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Authentication</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              All API requests require a Bearer token in the <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>Authorization</code> header. Generate your API key from the Partner Dashboard.
            </p>
            <CodeBlock label="Header format">{`Authorization: Bearer ri_your_api_key_here`}</CodeBlock>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl font-black tracking-tight">Endpoints</h2>

            <EndpointCard
              method="POST"
              path="/api/v1/restore/jobs"
              description="Create a new restore job. Returns a job ID and presigned upload URL for the disk image."
              curl={`curl -X POST https://restoreit.app/api/v1/restore/jobs \\
  -H "Authorization: Bearer ri_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "drive_name": "Customer MacBook SSD",
    "mode": "deep",
    "callback_url": "https://yourapp.com/webhooks/restoreit",
    "external_ref": "ticket-1234"
  }'`}
              response={`{
  "success": true,
  "data": {
    "job_id": "job_abc123",
    "scan_id": "scan_def456",
    "upload_url": "https://restoreit.app/api/v1/restore/upload?scanId=scan_def456",
    "status": "awaiting_upload",
    "chunk_size": 16777216
  }
}`}
            />

            <EndpointCard
              method="PUT"
              path="/api/v1/restore/upload?scanId={scanId}&chunkIndex={n}"
              description="Upload a chunk of the disk image. Send the raw binary as the request body. Chunk size must match the value returned when creating the job."
              curl={`curl -X PUT "https://restoreit.app/api/v1/restore/upload?scanId=scan_def456&chunkIndex=0" \\
  -H "Authorization: Bearer ri_your_api_key" \\
  -H "Content-Type: application/octet-stream" \\
  --data-binary @chunk-0.bin`}
              response={`{
  "success": true,
  "data": {
    "chunk_index": 0,
    "bytes_received": 16777216,
    "total_chunks": 1,
    "status": "scanning"
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/restore/jobs"
              description="List all restore jobs for your partner account. Supports pagination."
              curl={`curl https://restoreit.app/api/v1/restore/jobs \\
  -H "Authorization: Bearer ri_your_api_key"`}
              response={`{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_abc123",
        "status": "completed",
        "drive_name": "Customer MacBook SSD",
        "files_found": 847,
        "data_recovered": 2147483648,
        "created_at": 1709510400000,
        "completed_at": 1709510700000
      }
    ],
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/restore/jobs/:jobId"
              description="Get detailed status for a specific restore job."
              curl={`curl https://restoreit.app/api/v1/restore/jobs/job_abc123 \\
  -H "Authorization: Bearer ri_your_api_key"`}
              response={`{
  "success": true,
  "data": {
    "id": "job_abc123",
    "status": "completed",
    "drive_name": "Customer MacBook SSD",
    "mode": "deep",
    "files_found": 847,
    "data_recovered": 2147483648,
    "external_ref": "ticket-1234",
    "created_at": 1709510400000,
    "completed_at": 1709510700000
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/restore/jobs/:jobId/files"
              description="List all recovered files for a completed job. Includes file type, size, integrity score, and confidence."
              curl={`curl https://restoreit.app/api/v1/restore/jobs/job_abc123/files \\
  -H "Authorization: Bearer ri_your_api_key"`}
              response={`{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_xyz789",
        "file_name": "recovered-a1b2c3d4.jpg",
        "file_type": "jpg",
        "size_bytes": 3145728,
        "confidence": 98,
        "integrity": "intact",
        "created_at": 1709510650000
      }
    ],
    "total": 847
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/restore/jobs/:jobId/files/:fileId/download"
              description="Download a recovered file. Streams the file directly with appropriate content headers."
              curl={`curl -OJ https://restoreit.app/api/v1/restore/jobs/job_abc123/files/file_xyz789/download \\
  -H "Authorization: Bearer ri_your_api_key"`}
              response={`# Binary file stream with headers:
# Content-Type: image/jpeg
# Content-Disposition: attachment; filename="recovered-a1b2c3d4.jpg"
# Content-Length: 3145728`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/usage"
              description="Get your current billing period usage breakdown."
              curl={`curl https://restoreit.app/api/v1/usage \\
  -H "Authorization: Bearer ri_your_api_key"`}
              response={`{
  "success": true,
  "data": {
    "period": "2026-03",
    "jobs_created": 42,
    "gb_scanned": 128.5,
    "files_restored": 12847,
    "tier": "growth",
    "rate_per_gb": 0.30
  }
}`}
            />
          </div>
        </section>

        {/* Webhooks */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Webhooks</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              When you provide a <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>callback_url</code> during job creation, we send webhook notifications for job status changes.
              All webhooks are signed with HMAC-SHA256 so you can verify authenticity.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Signature Verification</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Compute <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>HMAC-SHA256(&quot;{'${timestamp}.${body}'}&quot;, webhook_secret)</code> and
                compare against the <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>X-RestoreIt-Signature</code> header.
              </p>
              <CodeBlock label="Webhook headers">{`X-RestoreIt-Signature: sha256=a1b2c3d4e5f6...
X-RestoreIt-Timestamp: 1709510700
Content-Type: application/json`}</CodeBlock>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Node.js Verification Example</h3>
              <CodeBlock label="verify-webhook.js">{`import crypto from 'crypto';

function verifyWebhook(body, signature, timestamp, secret) {
  const payload = \`\${timestamp}.\${body}\`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return \`sha256=\${expected}\` === signature;
}

// In your webhook handler:
const sig = req.headers['x-restoreit-signature'];
const ts = req.headers['x-restoreit-timestamp'];
const isValid = verifyWebhook(req.body, sig, ts, WEBHOOK_SECRET);`}</CodeBlock>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Example Payload</h3>
              <CodeBlock label="Webhook body">{`{
  "event": "job.completed",
  "job_id": "job_abc123",
  "external_ref": "ticket-1234",
  "status": "completed",
  "files_found": 847,
  "data_recovered": 2147483648,
  "completed_at": 1709510700000
}`}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Error Codes</h2>
            <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
              <div className="min-w-[400px]">
                <div className="grid grid-cols-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Code</div>
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">HTTP Status</div>
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Description</div>
                </div>
                {[
                  { code: 'unauthorized', status: '401', desc: 'Missing or invalid API key' },
                  { code: 'forbidden', status: '403', desc: 'API key does not have access to this resource' },
                  { code: 'not_found', status: '404', desc: 'Resource not found' },
                  { code: 'validation_error', status: '400', desc: 'Request body failed validation' },
                  { code: 'rate_limited', status: '429', desc: 'Too many requests — check Retry-After header' },
                  { code: 'server_error', status: '500', desc: 'Internal server error' },
                ].map((err, i) => (
                  <div key={err.code} className={`grid grid-cols-3 ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                    <div className="p-4">
                      <code className="text-xs text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>{err.code}</code>
                    </div>
                    <div className="p-4 text-sm text-[var(--color-text-secondary)]">{err.status}</div>
                    <div className="p-4 text-sm text-[var(--color-text-secondary)]">{err.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Rate Limits</h2>
            <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
              <div className="min-w-[400px]">
                <div className="grid grid-cols-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Tier</div>
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Rate Limit</div>
                  <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Monthly Quota</div>
                </div>
                {[
                  { tier: 'Starter', rate: '100 req/min', quota: '50 GB' },
                  { tier: 'Growth', rate: '500 req/min', quota: '500 GB' },
                  { tier: 'Enterprise', rate: 'Unlimited', quota: 'Unlimited' },
                ].map((row, i) => (
                  <div key={row.tier} className={`grid grid-cols-3 ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                    <div className="p-4 text-sm font-bold">{row.tier}</div>
                    <div className="p-4 text-sm text-[var(--color-text-secondary)]">{row.rate}</div>
                    <div className="p-4 text-sm text-[var(--color-text-secondary)]">{row.quota}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Response Headers</h3>
              <CodeBlock>{`X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1709510760
Retry-After: 12`}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Start building today.</h2>
            <p className="text-[var(--color-text-tertiary)] text-lg">
              Create an account and generate your API key from the Partner Dashboard.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 bg-[var(--color-accent)] hover:opacity-90 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)] active:scale-[0.98]"
            >
              Register as Partner <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
