"use client";
// /account/history — Restore history log (real D1 data)
import { useState, useEffect } from 'react';
import { History, Download, ExternalLink, Calendar, Filter, Search, RotateCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Scan {
    id: string;
    driveName: string;
    mode: string;
    status: string;
    filesFound: number;
    dataSize: number;
    restoreRate: number;
    startedAt: string;
    completedAt: string | null;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(startStr: string, endStr: string | null): string {
    if (!endStr) return '—';
    const ms = new Date(endStr).getTime() - new Date(startStr).getTime();
    const mins = Math.round(ms / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function HistoryPage() {
    const [scans, setScans] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/scans')
            .then(res => res.json() as Promise<{ success: boolean; data?: Scan[] }>)
            .then(data => {
                if (data.success && data.data) setScans(data.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = scans.filter(s =>
        s.driveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold mb-1">Restore History</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Log of all past scans and restoration sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] focus:outline-none focus:border-[var(--color-accent)]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 rounded-2xl border border-[var(--color-border-subtle)] text-center">
                    <Loader2 size={32} className="text-[var(--color-text-dim)] mx-auto mb-3 animate-spin" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Loading history...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 rounded-2xl border border-[var(--color-border-subtle)] text-center">
                    <History size={32} className="text-[var(--color-disabled-text)] mx-auto mb-3" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">No restore sessions found.</p>
                    <p className="text-[var(--color-text-dim)] text-xs mt-1">Start a scan from the Restore page to see your history here.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                    <div className="grid grid-cols-6 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-card)] text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-tertiary)]">
                        <div className="col-span-2">Session / Drive</div>
                        <div>Status</div>
                        <div>Files / Size</div>
                        <div>Restore Rate</div>
                        <div className="text-right">Action</div>
                    </div>

                    <div className="divide-y divide-[var(--color-border-subtle)]">
                        {filtered.map((scan) => (
                            <div key={scan.id} className="grid grid-cols-6 px-6 py-5 items-center hover:bg-[var(--color-card)] transition-all">
                                <div className="col-span-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{scan.driveName}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${scan.mode === 'deep' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20' : 'bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'}`}>
                                            {scan.mode === 'deep' ? 'Deep' : 'Quick'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                                        <Calendar size={10} /> {formatDate(scan.startedAt)} &middot; {scan.id.slice(0, 8)}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                        scan.status === 'ready'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : scan.status === 'failed' || scan.status === 'cancelled'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {scan.status}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm">{scan.filesFound.toLocaleString()} files</div>
                                    <div className="text-[var(--color-text-dim)] text-[10px]">{formatBytes(scan.dataSize)} &middot; {formatDuration(scan.startedAt, scan.completedAt)}</div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-24 h-1 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${scan.restoreRate > 90 ? 'bg-green-500' : 'bg-[var(--color-accent)]'}`}
                                            style={{ width: `${scan.restoreRate}%` }}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-[var(--color-text-secondary)]">{scan.restoreRate}%</div>
                                </div>

                                <div className="text-right">
                                    {scan.status === 'ready' ? (
                                        <div className="flex items-center justify-end gap-2 text-[11px]">
                                            <Link href="/account/cloud" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-all">
                                                <ExternalLink size={12} /> Cloud
                                            </Link>
                                            <button className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-green-500/40 hover:bg-green-500/5 text-[var(--color-text-secondary)] hover:text-green-400 transition-all">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ) : scan.status === 'failed' ? (
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-all text-[11px] ml-auto">
                                            <RotateCcw size={12} /> Retry
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <History size={24} className="text-[var(--color-text-dim)]" />
                    <div>
                        <div className="font-semibold">History Retention</div>
                        <div className="text-sm text-[var(--color-text-tertiary)]">Free accounts keep 90 days. Protection Plan keeps logs indefinitely.</div>
                    </div>
                </div>
                <Link href="/account/protection" className="text-xs font-bold text-[var(--color-accent)] hover:underline uppercase tracking-widest">Upgrade</Link>
            </div>
        </div>
    );
}
