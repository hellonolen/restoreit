"use client";
// /account/history — Detailed restore log
import { useState } from 'react';
import { History, Download, ExternalLink, Calendar, HardDrive, Filter, Search, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const mockHistory = [
    {
        id: 'SESS-001',
        date: 'Mar 3, 2026',
        drive: 'Macintosh HD',
        mode: 'Deep Scan',
        status: 'completed',
        files: 2847,
        size: '12.4 GB',
        duration: '42m',
        rate: '94%',
        vaultId: 'VLT-123A',
    },
    {
        id: 'SESS-002',
        date: 'Feb 12, 2026',
        drive: 'External Backup',
        mode: 'Quick Scan',
        status: 'completed',
        files: 142,
        size: '850 MB',
        duration: '12m',
        rate: '100%',
        vaultId: 'VLT-234B',
    },
    {
        id: 'SESS-003',
        date: 'Jan 28, 2026',
        drive: 'SD Card (EOS)',
        mode: 'Deep Scan',
        status: 'cancelled',
        files: 12,
        size: '4.2 GB',
        duration: '5m',
        rate: '0%',
        vaultId: null,
    }
];

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white mb-1">Restore History</h1>
                    <p className="text-sm text-zinc-500">Log of all past scans and extraction sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1 / 2 -translate-y-1 / 2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                <div className="grid grid-cols-6 px-6 py-4 border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                    <div className="col-span-2">Session / Volume</div>
                    <div>Status</div>
                    <div>Files / Size</div>
                    <div>Restore Rate</div>
                    <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-white/5">
                    {mockHistory.map((session) => (
                        <div key={session.id} className="grid grid-cols-6 px-6 py-5 items-center hover:bg-white/[0.01] transition-all">
                            <div className="col-span-2 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm">{session.drive}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${session.mode === 'Deep Scan' ? 'bg-[#8A2BE2]/10 text-[#8A2BE2] border border-[#8A2BE2]/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                                        {session.mode === 'Deep Scan' ? 'Deep' : 'Quick'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                    <Calendar size={10} /> {session.date} · {session.id}
                                </div>
                            </div>

                            <div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${session.status === 'completed'
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <div className="text-zinc-300 text-sm">{session.files.toLocaleString()} files</div>
                                <div className="text-zinc-600 text-[10px]">{session.size} · {session.duration}</div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${parseInt(session.rate) > 90 ? 'bg-green-500' : 'bg-[#8A2BE2]'}`}
                                        style={{ width: session.rate }}
                                    />
                                </div>
                                <div className="text-xs font-mono text-zinc-400">{session.rate} Success</div>
                            </div>

                            <div className="text-right">
                                {session.status === 'completed' && session.vaultId ? (
                                    <div className="flex items-center justify-end gap-2 text-[11px]">
                                        <Link href="/account/vault" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/5 text-zinc-400 hover:text-white transition-all">
                                            <ExternalLink size={12} /> Vault
                                        </Link>
                                        <button className="p-1.5 rounded-lg border border-white/10 hover:border-green-500/40 hover:bg-green-500/5 text-zinc-400 hover:text-green-400 transition-all">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/5 text-zinc-400 hover:text-white transition-all text-[11px] ml-auto">
                                        <RotateCcw size={12} /> Retry Scan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <History size={24} className="text-zinc-600" />
                    <div>
                        <div className="text-white font-semibold">Automatic Log Retention</div>
                        <div className="text-sm text-zinc-500">History is kept for 90 days. Professional accounts keep logs indefinitely.</div>
                    </div>
                </div>
                <Link href="/account/protection" className="text-xs font-bold text-[#8A2BE2] hover:underline uppercase tracking-widest">Upgrade Retention →</Link>
            </div>
        </div>
    );
}
