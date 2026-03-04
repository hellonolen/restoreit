// ProUpsell: Post-restoration $12/mo protection, restore readiness score, cloud retention countdown
"use client";

import { ShieldCheck, Activity, HardDrive, Bell, Star, CheckCircle2, Clock, Cpu, Cloud } from 'lucide-react';
import { ScanSession } from '../types';

interface ProUpsellProps {
    sessionStats: ScanSession | undefined;
    darkMode: boolean;
    onRestart: () => void;
    onBack?: () => void;
    onAccept?: () => void;
}

function RestoreScore({ score }: { score: number }) {
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg width="96" height="96" className="-rotate-90">
                <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white font-mono">{score}</span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Score</span>
            </div>
        </div>
    );
}

export default function ProUpsell({ sessionStats, darkMode, onRestart, onBack, onAccept }: ProUpsellProps) {
    const vaultDaysRemaining = 7;
    const restoreReadinessScore = 72;

    const benefits = [
        { icon: <HardDrive size={16} />, title: 'Disk Health Monitoring', desc: 'Continuous SMART status tracking for all connected drives.' },
        { icon: <Bell size={16} />, title: 'Corruption Detection Alerts', desc: 'Real-time warnings before catastrophic data loss occurs.' },
        { icon: <Activity size={16} />, title: 'File System Integrity Scanning', desc: 'Scheduled scans keep your storage healthy and ready for restoration.' },
        { icon: <Cpu size={16} />, title: 'Priority Restore Queue', desc: 'Skip the line — Pro subscribers process first in emergencies.' },
        { icon: <Cloud size={16} />, title: 'Extended Cloud Retention', desc: 'Extended RestoreIt Cloud access for 30 days vs 7-day standard.' },
        { icon: <Clock size={16} />, title: 'Restoration History Archive', desc: 'Full log of all past restore sessions and extracted files.' },
    ];

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 w-full space-y-8">

            {/* Success Banner */}
            <div className={`${darkMode ? 'bg-green-500/5 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-2xl p-6 flex items-center gap-4`}>
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Restore Successful</h2>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${darkMode ? 'border-white/10 text-zinc-500 hover:text-white' : 'border-black/5 text-zinc-400 hover:text-zinc-900'
                                    }`}
                            >
                                ← Adjust Extraction
                            </button>
                        )}
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {sessionStats ? `${sessionStats.filesFound.toLocaleString()} files restored · ${sessionStats.restoreRate}% restoration rate · ${sessionStats.mode === 'deep' ? 'Deep' : 'Quick'} scan` : 'Your files have been restored successfully.'}
                    </p>
                </div>
                {sessionStats && (
                    <div className={`text-right text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        <div className="font-mono text-green-400 text-base">{sessionStats.restoreRate}%</div>
                        <div>files restored</div>
                    </div>
                )}
            </div>

            {/* Cloud Retention Countdown */}
            <div className={`flex items-center gap-4 p-5 rounded-xl border ${darkMode ? 'border-orange-500/30 bg-orange-500/5' : 'border-orange-200 bg-orange-50'}`}>
                <Clock size={20} className="text-orange-400 shrink-0" />
                <div className="flex-1">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>RestoreIt Cloud expires in {vaultDaysRemaining} days</div>
                    <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>Your restored files will be permanently deleted from our servers after this window unless you upgrade to Pro.</div>
                </div>
                <div className="text-3xl font-light text-orange-400 font-mono shrink-0">{vaultDaysRemaining}d</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left: Pro Protection Offer */}
                <div className={`${darkMode ? 'bg-black/40 border-[#8A2BE2]/30' : 'bg-white border-[#8A2BE2]/20'} border rounded-2xl overflow-hidden relative`}>
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#8A2BE2]/0 via-[#8A2BE2] to-[#8A2BE2]/0"></div>

                    <div className="p-6 border-b border-[#8A2BE2]/20 flex items-center gap-3">
                        <ShieldCheck size={20} className="text-[#8A2BE2]" />
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Protect your devices so this never happens again.</h3>
                    </div>

                    <div className="p-6 space-y-5">
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            You just experienced what data loss feels like. RestoreIt Protection monitors your devices 24/7, detects early warning signs, and keeps RestoreIt Cloud always ready.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-3">
                            {benefits.map(({ icon, title, desc }) => (
                                <div key={title} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-white/[0.02]' : 'bg-zinc-50'}`}>
                                    <span className="text-[#8A2BE2] shrink-0 mt-0.5">{icon}</span>
                                    <div>
                                        <div className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{title}</div>
                                        <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}>
                            <div>
                                <div className={`font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>RestoreIt Pro Protection</div>
                                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Monthly · Cancel Anytime</div>
                            </div>
                            <div className={`text-3xl font-light ${darkMode ? 'text-white' : 'text-zinc-900'}`}>$12<span className="text-zinc-500 text-sm">/mo</span></div>
                        </div>

                        <button
                            onClick={onAccept}
                            className="w-full bg-[#8A2BE2] hover:bg-[#7e22ce] text-white px-5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-[0_0_24px_rgba(138,43,226,0.3)] hover:shadow-[0_0_32px_rgba(138,43,226,0.4)] flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={16} />
                            Enable Pro Protection — $12/mo
                        </button>

                        <button onClick={onRestart}
                            className={`w-full text-center text-xs transition-colors py-2 ${darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'}`}>
                            No thanks, I understand the risk. Take me to my restored files.
                        </button>
                    </div>
                </div>

                {/* Right: Restore Readiness Dashboard Preview */}
                <div className="space-y-4">
                    <div className={`p-5 rounded-xl border ${darkMode ? 'border-white/10 bg-black/30' : 'border-black/8 bg-white'}`}>
                        <div className={`text-xs uppercase tracking-widest font-bold mb-4 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Your Restore Readiness</div>
                        <div className="flex items-center gap-5 mb-5">
                            <RestoreScore score={restoreReadinessScore} />
                            <div>
                                <div className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Moderate Risk</div>
                                <div className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>Your disk health is below recommended thresholds. Pro Protection would have warned you 14 days before this failure.</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Disk SMART Health', value: '94%', status: 'good' },
                                { label: 'File System Integrity', value: '71%', status: 'warning' },
                                { label: 'Storage Redundancy', value: 'None', status: 'critical' },
                                { label: 'RestoreIt Cloud', value: 'Not active', status: 'critical' },
                            ].map(({ label, value, status }) => (
                                <div key={label} className="flex items-center justify-between text-xs">
                                    <span className={darkMode ? 'text-zinc-500' : 'text-zinc-500'}>{label}</span>
                                    <span className={`font-semibold ${status === 'good' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-5 rounded-xl border ${darkMode ? 'border-white/10 bg-black/30' : 'border-black/8 bg-white'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={14} className="text-[#8A2BE2] fill-[#8A2BE2]" />
                            <div className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>What Pro Would Have Done</div>
                        </div>
                        <ul className="space-y-2 text-xs">
                            {[
                                '⚡ Warned you 14 days before disk failure',
                                '🔒 Kept RestoreIt Cloud ready so you could skip the scan',
                                '🚀 Placed you first in the restore queue',
                                '📁 Already had your files backed in RestoreIt Cloud',
                            ].map(item => (
                                <li key={item} className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
