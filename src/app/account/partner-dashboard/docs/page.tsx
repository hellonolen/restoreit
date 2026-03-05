'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

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

export default function PartnerDocsPage() {
    const { user, isLoading } = useUser()
    const [isPartner, setIsPartner] = useState<boolean | null>(null)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        async function checkPartner() {
            try {
                const res = await fetch('/api/partner/dashboard')
                if (!res.ok) { setIsPartner(false); return }
                const data = await res.json() as { registered?: boolean }
                setIsPartner(data.registered === true)
            } catch {
                setIsPartner(false)
            } finally {
                setChecking(false)
            }
        }
        checkPartner()
    }, [])

    if (isLoading || checking) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-black tracking-tight">API Documentation</h1>
                <div className="text-sm text-[var(--color-text-dim)]">Verifying access...</div>
            </div>
        )
    }

    if (!user || !isPartner) {
        return (
            <div className="space-y-8">
                <h1 className="text-2xl font-black tracking-tight">API Documentation</h1>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 max-w-lg space-y-4 text-center">
                    <Lock size={32} className="mx-auto text-[var(--color-text-dim)]" />
                    <h2 className="text-lg font-bold">Partner Access Required</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Full API documentation is available exclusively to registered partners.
                        Register from your Partner Dashboard to receive your API key and unlock docs.
                    </p>
                    <Link
                        href="/account/partner-dashboard"
                        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-all"
                    >
                        Go to Partner Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-4">
                <Link href="/account/partner-dashboard" className="text-[var(--color-text-dim)] hover:text-[var(--color-foreground)] transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">API & MCP Documentation</h1>
                    <p className="text-xs text-[var(--color-text-dim)] mt-1">restoreit-as-a-Service — REST API & Model Context Protocol Reference</p>
                </div>
            </div>

            {/* Base URL */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 inline-flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Base URL</span>
                <code className="text-sm text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>https://restoreit.app</code>
            </div>

            {/* Authentication */}
            <div className="space-y-4">
                <h2 className="text-xl font-black tracking-tight">Authentication</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    All API requests require a Bearer token in the <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>Authorization</code> header. Your API key was provided during partner registration.
                </p>
                <CodeBlock label="Header format">{`Authorization: Bearer ri_your_api_key_here`}</CodeBlock>
            </div>

            {/* Endpoints */}
            <div className="space-y-8">
                <h2 className="text-xl font-black tracking-tight">Endpoints</h2>

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
    "files_restored": 12847
  }
}`}
                />
            </div>

            {/* Webhooks */}
            <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight">Webhooks</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    When you provide a <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>callback_url</code> during job creation, we send webhook notifications for job status changes.
                    All webhooks are signed with HMAC-SHA256 so you can verify authenticity.
                </p>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Signature Verification</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Compute <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>HMAC-SHA256(&quot;{`\${timestamp}.\${body}`}&quot;, webhook_secret)</code> and
                        compare against the <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>X-restoreit-Signature</code> header.
                    </p>
                    <CodeBlock label="Webhook headers">{`X-restoreit-Signature: sha256=a1b2c3d4e5f6...
X-restoreit-Timestamp: 1709510700
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

            {/* MCP Server */}
            <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight">MCP Server</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    Connect AI agents directly to restoreit via the <strong>Model Context Protocol</strong>. Your AI assistant can create restore jobs,
                    check status, list recovered files, and check usage — all through natural language. Uses the same Bearer token authentication as the REST API.
                </p>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Endpoint</h3>
                    <CodeBlock label="MCP Server URL">{`https://restoreit.app/api/mcp`}</CodeBlock>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Configuration</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Add this to your AI tool&apos;s MCP configuration:
                    </p>
                    <CodeBlock label="Claude Desktop / Cursor / etc.">{`{
  "mcpServers": {
    "restoreit": {
      "url": "https://restoreit.app/api/mcp",
      "headers": {
        "Authorization": "Bearer rstr_live_your_api_key"
      }
    }
  }
}`}</CodeBlock>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Available Tools</h3>
                    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                        <div className="min-w-[400px]">
                            <div className="grid grid-cols-2 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                                <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Tool</div>
                                <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Description</div>
                            </div>
                            {[
                                { tool: 'create_restore_job', desc: 'Create a new forensic restore job' },
                                { tool: 'list_restore_jobs', desc: 'List all jobs with pagination' },
                                { tool: 'get_restore_job', desc: 'Get status for a specific job' },
                                { tool: 'list_restored_files', desc: 'List recovered files for a completed job' },
                                { tool: 'get_usage', desc: 'Current billing period usage summary' },
                            ].map((row, i) => (
                                <div key={row.tool} className={`grid grid-cols-2 ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                                    <div className="p-4">
                                        <code className="text-xs text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>{row.tool}</code>
                                    </div>
                                    <div className="p-4 text-sm text-[var(--color-text-secondary)]">{row.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Example: Create a Job via MCP</h3>
                    <CodeBlock label="JSON-RPC Request">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_restore_job",
    "arguments": {
      "image_url": "https://your-bucket.s3.amazonaws.com/disk.img",
      "scan_mode": "deep",
      "callback_url": "https://yourapp.com/webhooks/restoreit",
      "external_ref": "ticket-1234"
    }
  }
}`}</CodeBlock>
                    <CodeBlock label="JSON-RPC Response">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{ \\"job_id\\": \\"rj_abc123\\", \\"status\\": \\"queued\\", \\"estimated_wait\\": \\"2-10 minutes\\" }"
    }]
  }
}`}</CodeBlock>
                </div>
            </div>

            {/* Error Codes */}
            <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight">Error Codes</h2>
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

            {/* Rate Limits */}
            <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight">Rate Limits</h2>
                <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                    <div className="min-w-[400px]">
                        <div className="grid grid-cols-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                            <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Tier</div>
                            <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Rate Limit</div>
                            <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Monthly Quota</div>
                        </div>
                        {[
                            { tier: 'Starter', rate: '30 req/min', quota: '100 GB' },
                            { tier: 'Growth', rate: '120 req/min', quota: '1 TB' },
                            { tier: 'Enterprise', rate: '500 req/min', quota: '5 TB' },
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
        </div>
    )
}
