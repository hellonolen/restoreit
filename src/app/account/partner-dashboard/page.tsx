'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { Copy, Check, RefreshCw, ExternalLink, ArrowUpRight } from 'lucide-react'
import { PARTNER_TIERS } from '@/lib/partner-constants'

interface KPIs {
  totalJobs: number
  completed: number
  inProgress: number
  failed: number
  avgCompletionMs: number
  gbScanned: number
  filesRestored: number
  monthlyPrice: number
}

interface RecentJob {
  id: string
  externalRef: string | null
  status: string
  filesFound: number
  dataRecovered: number
  createdAt: number
  completedAt: number | null
}

interface DashboardData {
  registered: boolean
  partner?: { name: string; tier: string; apiKeyHint: string }
  kpis?: KPIs
  recentJobs?: RecentJob[]
  recentWebhooks?: WebhookLog[]
}

interface WebhookLog {
  id: string
  event: string
  callbackUrl: string
  statusCode: number | null
  success: boolean
  attempts: number
  errorMessage: string | null
  deliveredAt: number
}

interface RegisterResponse {
  api_key: string
  webhook_secret: string
  partner_id: string
  name: string
  tier: string
  error?: string
}

function formatMs(ms: number): string {
  if (ms === 0) return '--'
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = seconds / 60
  return `${minutes.toFixed(1)}m`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-[var(--color-card-hover)] transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-[var(--color-text-dim)]" />}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    downloading: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    queued: 'bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[status] ?? styles.queued}`}>
      {status}
    </span>
  )
}

export default function PartnerDashboardPage() {
  const { user, isLoading: userLoading } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Registration form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [registering, setRegistering] = useState(false)
  const [credentials, setCredentials] = useState<{ apiKey: string; webhookSecret: string } | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/partner/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard')
      const json = await res.json() as DashboardData
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Auto-refresh every 30s when registered
  useEffect(() => {
    if (!data?.registered) return
    const interval = setInterval(fetchDashboard, 30_000)
    return () => clearInterval(interval)
  }, [data?.registered, fetchDashboard])

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email && !regEmail) setRegEmail(user.email)
  }, [user?.email, regEmail])

  const handleRegister = async () => {
    setRegistering(true)
    setError(null)
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail }),
      })
      const json = await res.json() as RegisterResponse
      if (!res.ok) throw new Error(json.error ?? 'Registration failed')
      setCredentials({ apiKey: json.api_key, webhookSecret: json.webhook_secret })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setRegistering(false)
    }
  }

  const handleAcknowledge = () => {
    setAcknowledged(true)
    setCredentials(null)
    fetchDashboard()
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black tracking-tight">Partner API</h1>
        <div className="text-sm text-[var(--color-text-dim)]">Loading...</div>
      </div>
    )
  }

  // State 2: Just registered — show credentials
  if (credentials && !acknowledged) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-black tracking-tight">Partner API</h1>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 md:p-8 space-y-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">Registration Complete</div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Save your credentials below. The API key will <strong>never be shown again</strong>.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)] block mb-2">API Key</label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
                <code className="flex-1 text-xs text-[var(--color-accent)] break-all" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {credentials.apiKey}
                </code>
                <CopyButton text={credentials.apiKey} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)] block mb-2">Webhook Secret</label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
                <code className="flex-1 text-xs text-[var(--color-accent)] break-all" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {credentials.webhookSecret}
                </code>
                <CopyButton text={credentials.webhookSecret} />
              </div>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            className="h-12 px-8 rounded-2xl bg-[var(--color-accent)] text-white font-black text-sm uppercase tracking-[0.15em] hover:opacity-90 transition-all"
          >
            I&apos;ve Saved My Keys
          </button>
        </div>
      </div>
    )
  }

  // State 1: Not registered — show registration form
  if (!data?.registered) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-black tracking-tight">Partner API</h1>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 md:p-8 space-y-6 max-w-lg">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)]">Register as Partner</div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Get API access to create restore jobs, upload disk images, and deliver restores to your customers.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)] block mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your repair shop name"
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)] block mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={registering || !regName.trim()}
            className="h-12 px-8 rounded-2xl bg-[var(--color-accent)] text-white font-black text-sm uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registering ? 'Registering...' : 'Register'}
          </button>

          <a
            href="/account/partner-dashboard/docs"
            className="flex items-center gap-2 text-xs text-[var(--color-accent)] hover:underline"
          >
            Read the API docs <ExternalLink size={12} />
          </a>
        </div>
      </div>
    )
  }

  // State 3: Dashboard
  const { partner, kpis, recentJobs, recentWebhooks } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black tracking-tight">Partner API</h1>
        <button
          onClick={() => { setLoading(true); fetchDashboard() }}
          className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status bar */}
      {partner && (
        <div className="flex items-center gap-6 flex-wrap text-xs">
          <div>
            <span className="text-[var(--color-text-dim)]">Partner: </span>
            <span className="font-bold">{partner.name}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-dim)]">Tier: </span>
            <span className="font-bold capitalize">{partner.tier}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-dim)]">Key: </span>
            <code className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>{partner.apiKeyHint}</code>
          </div>
        </div>
      )}

      {/* Upgrade Tier */}
      {partner && partner.tier !== 'enterprise' && (
        <div className="rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.03] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-1">Upgrade Your Plan</div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {partner.tier === 'starter'
                ? 'Unlock priority scanning, bulk uploads, and 1 TB scan volume with Growth.'
                : 'Get 5 TB volume, deep scan priority, and 99.9% uptime guarantee with Enterprise.'}
            </p>
          </div>
          <Link
            href={`/checkout/partner?tier=${partner.tier === 'starter' ? 'growth' : 'enterprise'}`}
            className="shrink-0 h-10 px-6 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-all flex items-center gap-2"
          >
            Upgrade <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total Jobs', value: kpis.totalJobs.toLocaleString() },
            { label: 'Completed', value: kpis.completed.toLocaleString() },
            { label: 'In Progress', value: kpis.inProgress.toLocaleString() },
            { label: 'Avg Completion', value: formatMs(kpis.avgCompletionMs) },
            { label: 'GB Scanned', value: `${kpis.gbScanned.toFixed(2)} GB` },
            { label: 'Plan', value: `$${kpis.monthlyPrice}/mo` },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">{kpi.label}</div>
              <div className="text-2xl font-black">{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Recent Jobs</h2>
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Job ID</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Ref</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Status</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Files</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Data</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-t border-[var(--color-border-subtle)]">
                      <td className="p-4">
                        <code className="text-xs text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                          {job.id.slice(0, 12)}...
                        </code>
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{job.externalRef ?? '--'}</td>
                      <td className="p-4"><StatusBadge status={job.status} /></td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{job.filesFound.toLocaleString()}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{formatBytes(job.dataRecovered)}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Event Logs */}
      {recentWebhooks && recentWebhooks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Webhook Event Logs</h2>
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Event</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Status</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Code</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Attempts</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWebhooks.map((wh) => (
                    <tr key={wh.id} className="border-t border-[var(--color-border-subtle)]">
                      <td className="p-4">
                        <code className="text-xs text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                          {wh.event}
                        </code>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${wh.success
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {wh.success ? 'Delivered' : 'Failed'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{wh.statusCode ?? '--'}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{wh.attempts}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">
                        {new Date(wh.deliveredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {recentJobs && recentJobs.length === 0 && kpis && kpis.totalJobs === 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center space-y-3">
          <div className="text-[var(--color-text-dim)] text-sm">No jobs yet.</div>
          <a
            href="/account/partner-dashboard/docs"
            className="inline-flex items-center gap-2 text-xs text-[var(--color-accent)] hover:underline"
          >
            Read the docs to get started <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  )
}
