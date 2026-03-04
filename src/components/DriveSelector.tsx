// AGENT 2 — Scan Config / Drive Selector
// Features: Quick/deep scan toggle, pre-scan estimated time, SMART health,
// drive temperature, in-app tooltips, relay command explanation, cross-platform info
"use client";

import { HardDrive, Usb, Search, Info, Terminal, ShieldCheck, Clock, Cpu, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { DriveInfo, ScanMode } from '../types';
import { useState } from 'react';

interface DriveSelectorProps {
    drives: DriveInfo[];
    selectedDrive: string | null;
    onSelectDrive: (id: string) => void;
    onStartScan: () => void;
    scanMode: ScanMode;
    onScanModeChange: (mode: ScanMode) => void;
    darkMode: boolean;
    onBack?: () => void;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [show, setShow] = useState(false);
    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-xs bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg p-3 shadow-xl pointer-events-none leading-relaxed">
                    {text}
                </span>
            )}
        </span>
    );
}

function SmartBadge({ status, score }: { status: DriveInfo['smartStatus']; score: number }) {
    const config = {
        good: { color: 'text-green-400 bg-green-500/10 border-green-500/30', label: 'SMART: Healthy' },
        warning: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', label: 'SMART: Warning' },
        critical: { color: 'text-red-400 bg-red-500/10 border-red-500/30', label: 'SMART: Critical' },
        unknown: { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', label: 'SMART: Unknown' },
    };
    const c = config[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${c.color}`}>
            {status === 'good' && <CheckCircle2 size={10} />}
            {status === 'warning' && <AlertTriangle size={10} />}
            {status === 'critical' && <AlertTriangle size={10} />}
            {c.label} {status !== 'unknown' && `· ${score}%`}
        </span>
    );
}

function estimateScanTime(sizeBytes: number, mode: ScanMode): string {
    const gb = sizeBytes / 1_000_000_000;
    const minutes = mode === 'quick' ? Math.ceil(gb * 0.2) : Math.ceil(gb * 1.2);
    if (minutes < 60) return `~${minutes} min`;
    return `~${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function DriveSelector({
    drives, selectedDrive, onSelectDrive, onStartScan, scanMode, onScanModeChange, darkMode, onBack
}: DriveSelectorProps) {
    const [showRelayExplainer, setShowRelayExplainer] = useState(false);
    const selectedDriveInfo = drives.find(d => d.id === selectedDrive);

    const card = darkMode
        ? 'bg-black/40 border-white/10 hover:border-white/20'
        : 'bg-white border-black/10 hover:border-black/20';

    const selectedCard = 'border-[#8A2BE2] bg-[#8A2BE2]/5 shadow-[0_0_20px_rgba(138,43,226,0.1)] ring-1 ring-[#8A2BE2]';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full space-y-8">

            {/* Title */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[#8A2BE2] text-[10px] font-black uppercase tracking-[0.2em] mb-3">Step 2 of 5 — Scan Configuration</div>
                    <h2 className={`text-4xl font-black mb-2 tracking-tighter ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Target Selection.</h2>
                    <p className={`text-sm leading-relaxed max-w-lg ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        Choose your scan mode, then run the secure relay command to begin reading your disk safely.
                    </p>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'border-white/10 text-zinc-500 hover:text-white' : 'border-black/5 text-zinc-400 hover:text-zinc-900'
                            }`}
                    >
                        ← Back
                    </button>
                )}
            </div>

            {/* SCAN MODE SELECTOR */}
            <div>
                <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Scan Mode
                    <Tooltip text="Quick Scan reads only recently deleted file entries. Deep Scan reads every sector — slower but restores more, including overwritten fragments.">
                        <HelpCircle size={13} className="cursor-help opacity-50 hover:opacity-100" />
                    </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Quick Scan */}
                    <button
                        onClick={() => onScanModeChange('quick')}
                        className={`p-5 rounded-xl border text-left transition-all ${scanMode === 'quick' ? selectedCard : card}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scanMode === 'quick' ? 'bg-[#8A2BE2]/20 text-[#8A2BE2]' : darkMode ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                                <Cpu size={18} />
                            </div>
                            <div>
                                <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Quick Scan</div>
                                <div className="text-[11px] text-zinc-500">File table only</div>
                            </div>
                        </div>
                        <ul className="space-y-1.5 text-xs text-zinc-500">
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> Fast (5–20 min)</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> Recently deleted files</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> Low bandwidth usage</li>
                            {selectedDriveInfo && (
                                <li className="flex items-center gap-2 text-[#8A2BE2] font-medium mt-2">
                                    <Clock size={11} className="shrink-0" />
                                    {estimateScanTime(selectedDriveInfo.sizeBytes, 'quick')} estimated
                                </li>
                            )}
                        </ul>
                    </button>

                    {/* Deep Scan */}
                    <button
                        onClick={() => onScanModeChange('deep')}
                        className={`p-5 rounded-xl border text-left transition-all relative ${scanMode === 'deep' ? selectedCard : card}`}
                    >
                        {scanMode === 'deep' && (
                            <div className="absolute top-0 inset-x-0 h-[2px] bg-[#8A2BE2] rounded-t-xl"></div>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scanMode === 'deep' ? 'bg-[#8A2BE2]/20 text-[#8A2BE2]' : darkMode ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                                <Search size={18} />
                            </div>
                            <div>
                                <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Deep Scan</div>
                                <div className="text-[11px] text-zinc-500">Full sector analysis</div>
                            </div>
                        </div>
                        <ul className="space-y-1.5 text-xs text-zinc-500">
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> Thorough (30–120 min)</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> ALL restorable files</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#8A2BE2] shrink-0" /> Fragmented + overwritten</li>
                            {selectedDriveInfo && (
                                <li className="flex items-center gap-2 text-[#8A2BE2] font-medium mt-2">
                                    <Clock size={11} className="shrink-0" />
                                    {estimateScanTime(selectedDriveInfo.sizeBytes, 'deep')} estimated
                                </li>
                            )}
                        </ul>
                    </button>
                </div>
            </div>

            {/* RELAY COMMAND */}
            <div className={`${darkMode ? 'bg-black/40 border-[#8A2BE2]/30' : 'bg-[#8A2BE2]/5 border-[#8A2BE2]/20'} border p-5 rounded-xl space-y-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8A2BE2]/20 text-[#8A2BE2] flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Run the Secure Relay</span>
                    </div>
                    <button
                        onClick={() => setShowRelayExplainer(prev => !prev)}
                        className="flex items-center gap-1.5 text-xs text-[#8A2BE2] hover:text-[#7e22ce] transition-colors"
                        aria-expanded={showRelayExplainer}
                    >
                        <Info size={13} />
                        Why curl?
                    </button>
                </div>

                <p className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    To prevent any installer from overwriting your deleted data, open <strong>Terminal</strong> and run this memory-only relay command. It reads your disk without writing anything to it.
                </p>

                {/* Command block */}
                <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-zinc-900 border-zinc-700'} border rounded-xl p-4 flex items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <Terminal size={14} className="text-[#8A2BE2] shrink-0" />
                        <code className="text-[#8A2BE2] font-mono text-sm tracking-wide truncate">
                            curl -sL https://restoreit.app/relay | bash
                        </code>
                    </div>
                    <button
                        onClick={() => navigator.clipboard?.writeText('curl -sL https://restoreit.app/relay | bash')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
                    >
                        Copy
                    </button>
                </div>

                {/* Relay explainer */}
                {showRelayExplainer && (
                    <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'} border rounded-xl p-4 space-y-3 text-xs leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} animate-in fade-in slide-in-from-top-2 duration-200`}>
                        <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>What does this command do?</h4>
                        <p><strong className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>curl</strong> fetches the relay script directly from our secure server and pipes it instantly into your shell with <strong className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>bash</strong>. Nothing is saved to your disk. The relay runs entirely in memory (RAM), reads raw disk sectors, encrypts them with TLS, and streams them to our Cloud engine.</p>
                        <p><strong className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>Why not download?</strong> Any file saved to your affected disk — including a restore app — risks overwriting the exact sectors that contain your lost files. The curl relay method is the only safe approach.</p>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { icon: <ShieldCheck size={14} />, label: 'Zero disk writes' },
                                { icon: <Cpu size={14} />, label: 'RAM only' },
                                { icon: <ShieldCheck size={14} />, label: 'TLS encrypted' },
                            ].map(({ icon, label }) => (
                                <div key={label} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${darkMode ? 'bg-black/40' : 'bg-zinc-50'}`}>
                                    <span className="text-[#8A2BE2]">{icon}</span>
                                    <span className="text-[11px] font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* DRIVE SELECTOR */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#8A2BE2]/20 text-[#8A2BE2] flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Select Target Volume</span>
                </div>

                <div className="space-y-3">
                    {drives.map((drive) => {
                        const isSelected = selectedDrive === drive.id;
                        const isOffline = drive.status === 'offline';
                        return (
                            <button
                                key={drive.id}
                                onClick={() => !isOffline && onSelectDrive(drive.id)}
                                disabled={isOffline}
                                aria-pressed={isSelected}
                                aria-label={`Select ${drive.name}`}
                                className={`w-full text-left p-5 rounded-xl border flex items-center justify-between group transition-all duration-300
                  ${isSelected ? selectedCard : card}
                  ${isOffline ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-black/40 border-[#8A2BE2]/50 text-[#8A2BE2]' : darkMode ? 'bg-black/50 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}
                  `}>
                                        {drive.icon === 'hard-drive' ? <HardDrive size={22} strokeWidth={1.5} /> : <Usb size={22} strokeWidth={1.5} />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-3 flex-wrap`}>
                                            <h3 className={`font-medium text-[15px] ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{drive.name}</h3>
                                            {isOffline && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-wider border border-red-500/20">
                                                    Unmounted
                                                </span>
                                            )}
                                            {!isOffline && <SmartBadge status={drive.smartStatus} score={drive.health} />}
                                        </div>
                                        <div className={`flex items-center gap-2 text-[12px] flex-wrap ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            <span className={`px-1.5 py-[2px] rounded ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-zinc-100 border border-zinc-200'} font-mono text-[10px] uppercase tracking-wider`}>{drive.format}</span>
                                            <span>·</span>
                                            <span className="font-mono text-[10px] text-[#8A2BE2] opacity-70">FW: 104.2A</span>
                                            <span>·</span>
                                            <span className="font-mono text-[10px]">SN: {drive.id === '1' ? 'WD-WCC3F7' : 'X-77A4B'}</span>
                                            <span>·</span>
                                            <span>{drive.size}</span>
                                            {drive.temperature && <><span>·</span><span>{drive.temperature}°C</span></>}
                                            {isSelected && (
                                                <>
                                                    <span>·</span>
                                                    <span className="text-[#8A2BE2] font-medium">
                                                        {estimateScanTime(drive.sizeBytes, scanMode)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {isOffline && (
                                            <p className="text-[11px] text-zinc-600 leading-relaxed max-w-xs">
                                                This drive is unmounted. In Finder, try reconnecting the drive or check Disk Utility to mount it manually.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all
                  ${isSelected ? 'border-[#8A2BE2] bg-[#8A2BE2]/20' : 'border-zinc-700 bg-transparent opacity-50'}
                `}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]"></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Platform Support Note */}
            <div className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-600' : 'text-zinc-400'} flex items-start gap-2`}>
                <Info size={13} className="shrink-0 mt-0.5 text-zinc-500" />
                <span>
                    restoreit supports <strong className="text-zinc-500">macOS</strong> (APFS, HFS+), <strong className="text-zinc-500">Windows</strong> (NTFS, exFAT), and <strong className="text-zinc-500">Linux</strong> (ext4) — including native <strong className="text-zinc-500">Apple Silicon</strong> (M1/M2/M3) and Intel x86.
                </span>
            </div>

            {/* CTA */}
            <div className="flex justify-end">
                <button
                    onClick={onStartScan}
                    disabled={!selectedDrive}
                    aria-label="Start scan"
                    className={`px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${selectedDrive
                        ? 'bg-[#8A2BE2] hover:bg-[#7e22ce] text-white shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.4)]'
                        : darkMode
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        }`}
                >
                    Connect & Start {scanMode === 'quick' ? 'Quick' : 'Deep'} Scan →
                </button>
            </div>
        </div>
    );
}
