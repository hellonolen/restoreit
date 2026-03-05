'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { RefreshCw, ArrowRight } from 'lucide-react'

interface FunnelData {
  funnel: Record<string, number>
  leads: Lead[]
  customers: Customer[]
  abandoned: AbandonedCart[]
  period: { days: number; since: string }
}

interface Lead {
  id: string
  email: string
  firstName: string
  createdAt: number
  scanCount: number
  lastScanAt: number | null
}

interface Customer {
  id: string
  email: string
  firstName: string
  createdAt: number
  tier: string
  amount: number
  paymentDate: number
}

interface AbandonedCart {
  userId: string
  email: string
  firstName: string
  tier: string | null
  createdAt: number
  channel: string
}

const PERIOD_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function pct(a: number, b: number): string {
  if (b === 0) return '--'
  return `${Math.round((a / b) * 100)}%`
}

export default function AdminPage() {
  const { user, isLoading: userLoading } = useUser()
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const fetchData = useCallback(async (period: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/funnel?days=${period}`)
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json() as FunnelData
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.isAdmin) fetchData(days)
  }, [user?.isAdmin, days, fetchData])

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black tracking-tight">Admin</h1>
        <div className="text-sm text-[var(--color-text-dim)]">Loading...</div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black tracking-tight">Admin</h1>
        <div className="text-sm text-[var(--color-text-dim)]">Access denied.</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black tracking-tight">Admin</h1>
        <div className="text-sm text-red-400">Failed to load funnel data.</div>
      </div>
    )
  }

  const { funnel, leads, customers, abandoned } = data

  const signups = (funnel['signup'] ?? 0)
  const scansCreated = (funnel['scan_created'] ?? 0)
  const checkoutsOpened = (funnel['checkout_opened'] ?? 0) + (funnel['partner_checkout_opened'] ?? 0)
  const paymentsCompleted = (funnel['payment_completed'] ?? 0) + (funnel['partner_payment_completed'] ?? 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black tracking-tight">Admin</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  days === opt.value
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(days)}
            className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Funnel Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Signups', value: signups },
          { label: 'Scans', value: scansCreated, conversion: pct(scansCreated, signups) },
          { label: 'Checkouts', value: checkoutsOpened, conversion: pct(checkoutsOpened, scansCreated) },
          { label: 'Payments', value: paymentsCompleted, conversion: pct(paymentsCompleted, checkoutsOpened) },
        ].map((card, i) => (
          <div key={card.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">{card.label}</div>
            <div className="text-3xl font-black">{card.value.toLocaleString()}</div>
            {card.conversion && i > 0 && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
                <ArrowRight size={10} /> {card.conversion} from prev
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Leads <span className="text-[var(--color-text-dim)] text-sm font-normal">({leads.length})</span></h2>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Scanned, didn&apos;t pay</div>
        </div>
        {leads.length > 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Name</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Email</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Scans</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Last Scan</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-[var(--color-border-subtle)]">
                      <td className="p-4 font-medium">{lead.firstName}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{lead.email}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{lead.scanCount}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{lead.lastScanAt ? formatDate(lead.lastScanAt) : '--'}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-dim)]">
            No leads in this period.
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Customers <span className="text-[var(--color-text-dim)] text-sm font-normal">({customers.length})</span></h2>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Paid</div>
        </div>
        {customers.length > 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Name</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Email</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Tier</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Amount</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={`${c.id}-${i}`} className="border-t border-[var(--color-border-subtle)]">
                      <td className="p-4 font-medium">{c.firstName}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{c.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                          {c.tier}
                        </span>
                      </td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">${c.amount}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{formatDate(c.paymentDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-dim)]">
            No customers in this period.
          </div>
        )}
      </div>

      {/* Abandoned Carts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Abandoned Carts <span className="text-[var(--color-text-dim)] text-sm font-normal">({abandoned.length})</span></h2>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Opened checkout, didn&apos;t pay</div>
        </div>
        {abandoned.length > 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Name</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Email</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Tier Selected</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Channel</th>
                    <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {abandoned.map((a, i) => (
                    <tr key={`${a.userId}-${i}`} className="border-t border-[var(--color-border-subtle)]">
                      <td className="p-4 font-medium">{a.firstName}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{a.email}</td>
                      <td className="p-4">
                        {a.tier ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            {a.tier}
                          </span>
                        ) : '--'}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)] capitalize">{a.channel}</td>
                      <td className="p-4 text-right text-[var(--color-text-secondary)]">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-dim)]">
            No abandoned carts in this period.
          </div>
        )}
      </div>
    </div>
  )
}
