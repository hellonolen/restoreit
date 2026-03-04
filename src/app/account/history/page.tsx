"use client";
// /account/history — Restore history log
import { useState } from 'react';
import { History, Download, ExternalLink, Calendar, Filter, Search, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { DEMO_SCAN_HISTORY } from '@/lib/demo-data';

export default function HistoryPage() {
    const { isDemo } = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    const history = isDemo ? DEMO_SCAN_HISTORY : [];
    const filtered = history.filter(s =>
        s.driveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white mb-1">Restore History</h1>
                    <p className="text-sm text-zinc-500">Log of all past scans and restoration sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--color-accent)]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="p-12 rounded-2xl border border-white/5 text-center">
                    <History size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No restore sessions found.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                    <div className="grid grid-cols-6 px-6 py-4 border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                        <div className="col-span-2">Session / Drive</div>
                        <div>Status</div>
                        <div>Files / Size</div>
                        <div>Restore Rate</div>
                        <div className="text-right">Action</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {filtered.map((session) => (
                            <div key={session.id} className="grid grid-cols-6 px-6 py-5 items-center hover:bg-white/[0.01] transition-all">
                                <div className="col-span-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">{session.driveName}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${session.mode === 'deep' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                                            {session.mode === 'deep' ? 'Deep' : 'Quick'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                        <Calendar size={10} /> {session.date} &middot; {session.id}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${session.status === 'completed'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : session.status === 'cancelled'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {session.status}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-zinc-300 text-sm">{session.filesFound.toLocaleString()} files</div>
                                    <div className="text-zinc-600 text-[10px]">{session.dataSize} &middot; {session.duration}</div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${parseInt(session.restoreRate) > 90 ? 'bg-green-500' : 'bg-[var(--color-accent)]'}`}
                                            style={{ width: session.restoreRate }}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-zinc-400">{session.restoreRate}</div>
                                </div>

                                <div className="text-right">
                                    {session.status === 'completed' ? (
                                        <div className="flex items-center justify-end gap-2 text-[11px]">
                                            <Link href="/account/vault" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-zinc-400 hover:text-white transition-all">
                                                <ExternalLink size={12} /> Cloud
                                            </Link>
                                            <button className="p-1.5 rounded-lg border border-white/10 hover:border-green-500/40 hover:bg-green-500/5 text-zinc-400 hover:text-green-400 transition-all">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-zinc-400 hover:text-white transition-all text-[11px] ml-auto">
                                            <RotateCcw size={12} /> Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <History size={24} className="text-zinc-600" />
                    <div>
                        <div className="text-white font-semibold">History Retention</div>
                        <div className="text-sm text-zinc-500">Free accounts keep 90 days. Protection Plan keeps logs indefinitely.</div>
                    </div>
                </div>
                <Link href="/account/protection" className="text-xs font-bold text-[var(--color-accent)] hover:underline uppercase tracking-widest">Upgrade</Link>
            </div>
        </div>
    );
}
