// AGENT 1 — ScanHistory drawer
"use client";
import { X, CheckCircle2, XCircle, Clock, HardDrive } from 'lucide-react';
import { ScanSession } from '../types';

interface ScanHistoryProps { sessions: ScanSession[]; onClose: () => void; darkMode: boolean; }

function formatBytes(b: number): string {
    if (!b) return '—';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

function ago(ts: number): string {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function ScanHistory({ sessions, onClose, darkMode }: ScanHistoryProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-stretch justify-end" role="dialog" aria-modal="true" aria-label="Scan history">
            <div className={`w-full max-w-md ${darkMode ? 'bg-[#111113] border-l border-white/10' : 'bg-white border-l border-black/10'} flex flex-col animate-in slide-in-from-right-8 duration-300`}>
                <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Scan History</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-white/5" aria-label="Close scan history"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sessions.length === 0 && (
                        <div className={`text-center py-12 text-sm ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>No previous scans.</div>
                    )}
                    {sessions.map(s => (
                        <div key={s.id} className={`p-4 rounded-xl border ${darkMode ? 'border-white/8 bg-black/30 hover:border-white/15' : 'border-black/8 bg-zinc-50 hover:border-black/15'} transition-colors`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive size={14} className="text-[#8A2BE2]" />
                                    <span className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{s.driveName}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border ${darkMode ? 'border-white/10 text-zinc-500 bg-white/5' : 'border-black/8 text-zinc-400 bg-zinc-100'}`}>{s.mode}</span>
                                </div>
                                {s.status === 'completed'
                                    ? <CheckCircle2 size={15} className="text-green-400" />
                                    : s.status === 'cancelled'
                                        ? <XCircle size={15} className="text-red-400" />
                                        : <Clock size={15} className="text-yellow-400" />}
                            </div>
                            <div className={`grid grid-cols-3 gap-3 text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                <div><div className="font-semibold text-zinc-400 mb-0.5">Files</div>{s.filesFound.toLocaleString()}</div>
                                <div><div className="font-semibold text-zinc-400 mb-0.5">Data</div>{formatBytes(s.dataSize)}</div>
                                <div><div className="font-semibold text-zinc-400 mb-0.5">Rate</div><span className="text-green-400">{s.recoveryRate}%</span></div>
                            </div>
                            <div className={`mt-2 text-[11px] ${darkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>{ago(s.startedAt)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
