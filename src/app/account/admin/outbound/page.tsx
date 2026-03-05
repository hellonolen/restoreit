'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { RefreshCw, Send, Search, Brain, Mail, Skull, Radio } from 'lucide-react'

interface OutboundStats {
    total: number
    scouted: number
    enriched: number
    researched: number
    ready_to_send: number
    sent: number
    dead: number
}

interface OutboundLead {
    id: number
    business_name: string
    website: string | null
    email: string | null
    status: string
    generated_subject: string | null
    last_contacted_at: string | null
    created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Search }> = {
    scouted: { label: 'Scouted', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Search },
    enriched: { label: 'Enriched', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: Mail },
    researched: { label: 'Researched', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Brain },
    ready_to_send: { label: 'Ready', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Radio },
    sent: { label: 'Sent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Send },
    dead: { label: 'Dead', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: Skull },
}

function timeAgo(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

export default function OutboundPage() {
    const { user, isLoading: userLoading } = useUser()
    const [stats, setStats] = useState<OutboundStats | null>(null)
    const [leads, setLeads] = useState<OutboundLead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/outbound')
            if (!res.ok) throw new Error('Failed to load')
            const json = await res.json() as { error?: string; stats?: OutboundStats; leads?: OutboundLead[] }
            if (json.error && !json.stats) {
                setError(json.error)
            } else {
                setStats(json.stats ?? null)
                setLeads(json.leads ?? [])
                setError(json.error ?? null)
            }
        } catch {
            setError('Failed to connect')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user?.isAdmin) fetchData()
    }, [user?.isAdmin, fetchData])

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh || !user?.isAdmin) return
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [autoRefresh, user?.isAdmin, fetchData])

    if (userLoading || loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-black tracking-tight">Outbound Engine</h1>
                <div className="text-sm text-[var(--color-text-dim)]">Connecting to Cloudflare D1...</div>
            </div>
        )
    }

    if (!user?.isAdmin) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-black tracking-tight">Outbound Engine</h1>
                <div className="text-sm text-[var(--color-text-dim)]">Access denied.</div>
            </div>
        )
    }

    const statCards = [
        { key: 'total', label: 'Total Leads', value: stats?.total ?? 0 },
        { key: 'scouted', label: 'Scouted', value: stats?.scouted ?? 0 },
        { key: 'enriched', label: 'Enriched', value: stats?.enriched ?? 0 },
        { key: 'researched', label: 'Researched', value: stats?.researched ?? 0 },
        { key: 'ready_to_send', label: 'Ready to Send', value: stats?.ready_to_send ?? 0 },
        { key: 'sent', label: 'Sent', value: stats?.sent ?? 0 },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight">Outbound Engine</h1>
                    <p className="text-xs text-[var(--color-text-dim)]">
                        Real-time B2B lead pipeline — powered by Cloudflare Workers
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${autoRefresh
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'text-[var(--color-text-dim)] border-[var(--color-border)] hover:text-[var(--color-foreground)]'
                            }`}
                    >
                        {autoRefresh ? '● Live' : '○ Paused'}
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
                    {error}
                </div>
            )}

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {statCards.map((card) => {
                    const config = STATUS_CONFIG[card.key]
                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-1"
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                                {card.label}
                            </div>
                            <div className={`text-3xl font-black ${config ? card.value > 0 ? config.color.split(' ')[0] : '' : ''}`}>
                                {card.value.toLocaleString()}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Leads Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                        Pipeline <span className="text-[var(--color-text-dim)] text-sm font-normal">({leads.length})</span>
                    </h2>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                        Most recent 50 leads
                    </div>
                </div>

                {leads.length > 0 ? (
                    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                                        <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Status</th>
                                        <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Business</th>
                                        <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Email</th>
                                        <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Subject</th>
                                        <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Last Contact</th>
                                        <th className="text-right p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">Discovered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead) => {
                                        const config = STATUS_CONFIG[lead.status] ?? {
                                            label: lead.status,
                                            color: 'text-[var(--color-text-dim)] bg-[var(--color-card)] border-[var(--color-border)]',
                                            icon: Search,
                                        }
                                        const Icon = config.icon
                                        return (
                                            <tr key={lead.id} className="border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-card-hover)] transition-colors">
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
                                                        <Icon size={10} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium max-w-[200px] truncate">{lead.business_name}</td>
                                                <td className="p-4 text-[var(--color-text-secondary)] max-w-[200px] truncate">{lead.email ?? '--'}</td>
                                                <td className="p-4 text-[var(--color-text-secondary)] max-w-[250px] truncate text-xs">{lead.generated_subject ?? '--'}</td>
                                                <td className="p-4 text-right text-[var(--color-text-secondary)] text-xs whitespace-nowrap">
                                                    {lead.last_contacted_at ? timeAgo(lead.last_contacted_at) : '--'}
                                                </td>
                                                <td className="p-4 text-right text-[var(--color-text-secondary)] text-xs whitespace-nowrap">
                                                    {timeAgo(lead.created_at)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center space-y-2">
                        <div className="text-4xl">🚀</div>
                        <div className="text-sm text-[var(--color-text-dim)]">
                            Engine is live. Leads will appear here as the Scout discovers them.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
