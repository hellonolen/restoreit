import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Pause, Play, X, Activity, HardDrive, FileText, Clock, Upload } from 'lucide-react';
import { ScanStats, NetworkStatus } from '../types';

interface ScannerProps {
    progress: number;
    files: { documents: number; media: number; archives: number; other: number; images: number; video: number; system: number; archive: number; };
    stats: ScanStats;
    paused: boolean;
    onPause: () => void;
    onCancel: () => void;
    onBack?: () => void;
}

const HEX_CHARS = '0123456789ABCDEF';
const LOG_COMMANDS = [
    'READ [sector 0xA4F2] -> BUFFER',
    'PARSING [NTFS_MFT_RECORD]',
    'INTEGRITY_CHECK [SHA-256] -> OK',
    'RELAY -> CLOUD_NODE_04',
    'STREAMING BIT_STREAM [EOF]',
    'SEARCH [fragment_0x1A] -> FOUND',
];

const generateBitStream = () => {
    return Array.from({ length: 120 }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
};

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

export default function Scanner({ progress, files, stats, paused, onPause, onCancel, onBack }: ScannerProps) {
    const totalFiles = files.documents + files.media + files.archives + files.other;
    const pct = Math.min(100, Math.round(progress));
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference - (pct / 100) * circumference;

    const [bitStream, setBitStream] = useState(generateBitStream());
    const [logLines, setLogLines] = useState<string[]>([]);

    useEffect(() => {
        if (paused || progress >= 100) return;
        const interval = setInterval(() => {
            setBitStream(generateBitStream());
            if (Math.random() > 0.7) {
                setLogLines(prev => [LOG_COMMANDS[Math.floor(Math.random() * LOG_COMMANDS.length)], ...prev].slice(0, 4));
            }
        }, 150);
        return () => clearInterval(interval);
    }, [paused, progress]);

    const networkConfig = {
        [NetworkStatus.CONNECTING]: { label: 'Connecting...', color: 'text-[var(--color-text-tertiary)]', Icon: Wifi },
        [NetworkStatus.NOMINAL]: { label: 'Signal Nominal', color: 'text-green-400', Icon: Wifi },
        [NetworkStatus.HANDSHAKE]: { label: 'Handshake Verified', color: 'text-green-400', Icon: Wifi },
        [NetworkStatus.STREAMING]: { label: 'Streaming Data', color: 'text-blue-400', Icon: Activity },
        [NetworkStatus.COMPLETED]: { label: 'Relay Complete', color: 'text-green-500', Icon: Wifi },
        [NetworkStatus.DEGRADED]: { label: 'High Latency', color: 'text-orange-400', Icon: Wifi },
        [NetworkStatus.OFFLINE]: { label: 'Signal Lost', color: 'text-red-400', Icon: WifiOff },
        [NetworkStatus.CONNECTED]: { label: 'Link Active', color: 'text-green-400', Icon: Wifi },
    };

    const net = networkConfig[stats.networkStatus as NetworkStatus] || networkConfig[NetworkStatus.OFFLINE];

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
                    <div className="text-[var(--color-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-[var(--color-accent)]"></span> Step 3/5 — Cloud Scan
                    </div>
                    <div className="flex items-center gap-4 mb-1">
                        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
                            {paused ? 'Scan Paused' : pct < 100 ? 'Scanning Drive...' : 'Scan Complete'}
                        </h2>
                        {onBack && pct < 100 && (
                            <button
                                onClick={onBack}
                                className="px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)]"
                            >
                                ← Refine Target
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {paused ? 'Resume soon — background processes may overwrite data.' : pct < 100 ? 'Securely scanning your drive in the cloud.' : 'Scan complete. Review what was detected.'}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${net.color} border-current/30 bg-current/10`}>
                    <net.Icon size={12} />
                    RestoreIt: {net.label}
                </span>
            </div>

            <div className="flex gap-10 items-start flex-wrap lg:flex-nowrap">
                {/* Progress Ring */}
                <div className="flex flex-col items-center gap-6 shrink-0">
                    <div className="relative">
                        <svg width="180" height="180" className="-rotate-90" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                            <circle cx="90" cy="90" r={radius} stroke="var(--color-border)" strokeWidth="10" fill="none" />
                            <circle cx="90" cy="90" r={radius} stroke="var(--color-accent)" strokeWidth="10" fill="none" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={strokeDash}
                                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-light font-mono text-[var(--color-foreground)]">{pct}%</span>
                            {paused && <span className="text-xs text-yellow-400 font-bold mt-1">PAUSED</span>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onPause} aria-label={paused ? 'Resume scan' : 'Pause scan'}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black uppercase tracking-widest transition-all ${paused ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/50 text-[var(--color-accent)]' : 'bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)]'}`}>
                            {paused ? <Play size={14} className="fill-current" /> : <Pause size={14} className="fill-current" />}
                            {paused ? 'Resume' : 'Pause'}
                        </button>
                        <button onClick={onCancel} aria-label="Cancel scan"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black uppercase tracking-widest transition-all bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-500/30">
                            <X size={14} />Abort
                        </button>
                    </div>
                </div>

                {/* Center: Sector Map & BitStream */}
                <div className="flex-1 space-y-6">
                    <div className="p-6 rounded-[24px] border bg-[var(--color-card)] border-[var(--color-border)] shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Activity size={12} className="text-[var(--color-accent)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Live Data Stream</span>
                            </div>
                            <span className="text-[9px] font-mono text-[var(--color-accent)] opacity-50">ENCRYPTED STREAM</span>
                        </div>
                        <div className="font-mono text-[11px] leading-relaxed break-all h-16 overflow-hidden text-[var(--color-accent)]/40">
                            {bitStream}
                            {bitStream}
                        </div>
                    </div>

                    <div className="p-6 rounded-[24px] border bg-[var(--color-card)] border-[var(--color-border)] shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText size={12} className="text-[var(--color-accent)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Live Command Monitor</span>
                            </div>
                            <span className="text-[8px] font-mono text-[var(--color-text-dim)]">SYSLOG_DAEMON</span>
                        </div>
                        <div className="space-y-1.5 h-20 overflow-hidden font-mono text-[10px]">
                            {logLines.map((line, i) => (
                                <div key={i} className={`flex gap-3 ${i === 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-disabled-text)]'}`}>
                                    <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{line}</span>
                                </div>
                            ))}
                            {logLines.length === 0 && <div className="text-[var(--color-disabled-text)] italic">Initializing cloud scan...</div>}
                        </div>
                    </div>

                    <div className="p-6 rounded-[24px] border bg-[var(--color-card)] border-[var(--color-border)] shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <HardDrive size={12} className="text-[var(--color-accent)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Sector Map Visualization</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></div>
                                    <span className="text-[8px] font-bold text-[var(--color-text-tertiary)] uppercase">Active</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-disabled-text)]"></div>
                                    <span className="text-[8px] font-bold text-[var(--color-text-tertiary)] uppercase">Pending</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-20 gap-1.5">
                            {Array.from({ length: 120 }).map((_, i) => {
                                const isActive = i / 120 < progress / 100;
                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-[2px] transition-all duration-500 ${isActive
                                            ? 'bg-[var(--color-accent)] shadow-[0_0_8px_rgba(138,43,226,0.4)]'
                                            : 'bg-[var(--color-card-hover)]'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3 min-w-0">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <HardDrive size={14} />, label: 'Sectors Scanned', value: `${(stats.sectorsScanned / 1000).toFixed(0)}K`, sub: `of ${(stats.totalSectors / 1000).toFixed(0)}K` },
                            { icon: <FileText size={14} />, label: 'Files Detected', value: stats.filesDetected.toLocaleString(), sub: 'fragments found' },
                            { icon: <Activity size={14} />, label: 'Restorable', value: formatBytes(stats.dataRestorable), sub: 'available' },
                            { icon: <Upload size={14} />, label: 'Upload Speed', value: `${(stats.uploadSpeedBps / 1_000_000).toFixed(1)}MB/s`, sub: `${formatBytes(stats.dataTransferred)} transferred` },
                        ].map(({ icon, label, value, sub }) => (
                            <div key={label} className="p-4 rounded-xl border bg-[var(--color-card)] border-[var(--color-border)]">
                                <div className="flex items-center gap-2 mb-2 text-[var(--color-accent)]">{icon}</div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-[var(--color-text-tertiary)]">{label}</div>
                                <div className="text-lg font-mono font-medium text-[var(--color-foreground)]">{value}</div>
                                <div className="text-[11px] text-[var(--color-text-tertiary)]">{sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time */}
                    <div className="p-4 rounded-xl border flex items-center gap-6 bg-[var(--color-card)] border-[var(--color-border)]">
                        <Clock size={15} className="text-[var(--color-accent)] shrink-0" />
                        <div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 text-[var(--color-text-tertiary)]">Elapsed</div>
                            <div className="text-base font-mono text-[var(--color-foreground)]">{formatTime(stats.elapsedSeconds)}</div>
                        </div>
                        <div className="w-px h-8 bg-[var(--color-border)]"></div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 text-[var(--color-text-tertiary)]">Remaining</div>
                            <div className={`text-base font-mono ${pct < 100 ? 'text-[var(--color-accent)]' : 'text-green-400'}`}>
                                {pct < 100 ? `~${formatTime(stats.estimatedRemainingSeconds)}` : '✓ Complete'}
                            </div>
                        </div>
                    </div>

                    {/* File type breakdown */}
                    <div className="p-4 rounded-xl border bg-[var(--color-card)] border-[var(--color-border)]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold mb-3 text-[var(--color-text-tertiary)]">File Types Detected</div>
                        <div className="space-y-2">
                            {fileTypes.map(({ label, count }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[var(--color-text-secondary)]">{label}</span>
                                        <span className="font-mono text-[var(--color-text-secondary)]">{count.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--color-card-hover)]">
                                        <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
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
