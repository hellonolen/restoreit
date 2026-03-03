// AGENT 3 — Scanner & Progress Component
"use client";


import { Wifi, WifiOff, Pause, Play, X, Activity, HardDrive, FileText, Clock, Upload } from 'lucide-react';
import { ScanStats } from '../types';

interface ScannerProps {
    progress: number;
    files: { documents: number; media: number; archives: number; other: number };
    stats: ScanStats;
    paused: boolean;
    onPause: () => void;
    onCancel: () => void;
    darkMode: boolean;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(seconds: number): string {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m < 60) return `${m}m ${s}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function Scanner({ progress, files, stats, paused, onPause, onCancel, darkMode }: ScannerProps) {
    const totalFiles = files.documents + files.media + files.archives + files.other;
    const pct = Math.min(100, Math.round(progress));
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference - (pct / 100) * circumference;

    const networkConfig = {
        connected: { label: 'Connected', color: 'text-green-400', Icon: Wifi },
        connecting: { label: 'Connecting...', color: 'text-yellow-400', Icon: Activity },
        slow: { label: 'Slow Connection', color: 'text-orange-400', Icon: Wifi },
        disconnected: { label: 'Disconnected', color: 'text-red-400', Icon: WifiOff },
    };
    const net = networkConfig[stats.networkStatus];

    const fileTypes = [
        { label: 'Documents', count: files.documents },
        { label: 'Media', count: files.media },
        { label: 'Archives', count: files.archives },
        { label: 'Other', count: files.other },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full space-y-8">

            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="text-[#8A2BE2] text-xs font-bold tracking-widest uppercase mb-3">Step 2 of 3</div>
                    <h2 className={`text-2xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        {paused ? 'Scan Paused' : pct < 100 ? 'Scanning Drive...' : 'Scan Complete'}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {paused ? 'Resume soon — background processes may overwrite recoverable data.' : pct < 100 ? 'Reading raw sectors and streaming securely to Cloud Vault.' : 'All sectors analyzed. Files are ready for extraction.'}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${net.color} border-current/30 bg-current/10`}>
                    <net.Icon size={12} />
                    Cloud Vault: {net.label}
                </span>
            </div>

            <div className="flex gap-10 items-start flex-wrap lg:flex-nowrap">

                {/* Progress Ring */}
                <div className="flex flex-col items-center gap-6 shrink-0">
                    <div className="relative">
                        <svg width="180" height="180" className="-rotate-90" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                            <circle cx="90" cy="90" r={radius} stroke={darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} strokeWidth="10" fill="none" />
                            <circle cx="90" cy="90" r={radius} stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={strokeDash}
                                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-light font-mono ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{pct}%</span>
                            {paused && <span className="text-xs text-yellow-400 font-bold mt-1">PAUSED</span>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onPause} aria-label={paused ? 'Resume scan' : 'Pause scan'}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${paused ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/50 text-[#8A2BE2]' : darkMode ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
                            {paused ? <Play size={14} /> : <Pause size={14} />}
                            {paused ? 'Resume' : 'Pause'}
                        </button>
                        <button onClick={onCancel} aria-label="Cancel scan"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${darkMode ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-red-500'}`}>
                            <X size={14} />Cancel
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3 min-w-0">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <HardDrive size={14} />, label: 'Sectors Scanned', value: `${(stats.sectorsScanned / 1000).toFixed(0)}K`, sub: `of ${(stats.totalSectors / 1000).toFixed(0)}K` },
                            { icon: <FileText size={14} />, label: 'Files Detected', value: stats.filesDetected.toLocaleString(), sub: 'fragments found' },
                            { icon: <Activity size={14} />, label: 'Recoverable', value: formatBytes(stats.dataRecoverable), sub: 'available' },
                            { icon: <Upload size={14} />, label: 'Upload Speed', value: `${(stats.uploadSpeedBps / 1_000_000).toFixed(1)} MB/s`, sub: `${formatBytes(stats.dataTransferred)} transferred` },
                        ].map(({ icon, label, value, sub }) => (
                            <div key={label} className={`p-4 rounded-xl border ${darkMode ? 'bg-black/30 border-white/8' : 'bg-white border-black/8'}`}>
                                <div className="flex items-center gap-2 mb-2 text-[#8A2BE2]">{icon}</div>
                                <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</div>
                                <div className={`text-lg font-mono font-medium ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{value}</div>
                                <div className="text-[11px] text-zinc-500">{sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time */}
                    <div className={`p-4 rounded-xl border flex items-center gap-6 ${darkMode ? 'bg-black/30 border-white/8' : 'bg-white border-black/8'}`}>
                        <Clock size={15} className="text-[#8A2BE2] shrink-0" />
                        <div>
                            <div className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Elapsed</div>
                            <div className={`text-base font-mono ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{formatTime(stats.elapsedSeconds)}</div>
                        </div>
                        <div className={`w-px h-8 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                        <div>
                            <div className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Remaining</div>
                            <div className={`text-base font-mono ${pct < 100 ? 'text-[#8A2BE2]' : 'text-green-400'}`}>
                                {pct < 100 ? `~${formatTime(stats.estimatedRemainingSeconds)}` : '✓ Complete'}
                            </div>
                        </div>
                    </div>

                    {/* File type breakdown */}
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/30 border-white/8' : 'bg-white border-black/8'}`}>
                        <div className={`text-[10px] uppercase tracking-wider font-semibold mb-3 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>File Types Detected</div>
                        <div className="space-y-2">
                            {fileTypes.map(({ label, count }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={darkMode ? 'text-zinc-400' : 'text-zinc-600'}>{label}</span>
                                        <span className={`font-mono ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{count.toLocaleString()}</span>
                                    </div>
                                    <div className={`h-1.5 rounded-full ${darkMode ? 'bg-white/5' : 'bg-zinc-100'}`}>
                                        <div className="h-full rounded-full bg-[#8A2BE2] transition-all duration-700"
                                            style={{ width: `${totalFiles > 0 ? (count / totalFiles) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
