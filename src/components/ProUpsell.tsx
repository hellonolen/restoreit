// ProUpsell: Post-restoration $29/mo protection, restore readiness score, cloud retention countdown
"use client";

import { ShieldCheck, Activity, HardDrive, Bell, Star, CheckCircle2, Clock, Cpu, Cloud } from 'lucide-react';
import { ScanSession } from '../types';

interface ProUpsellProps {
    sessionStats: ScanSession | undefined;
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
                <circle cx="48" cy="48" r={radius} stroke="var(--color-border)" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[var(--color-foreground)] font-mono">{score}</span>
                <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Score</span>
            </div>
        </div>
    );
}

export default function ProUpsell({ sessionStats, onRestart, onBack, onAccept }: ProUpsellProps) {
    const cloudDaysRemaining = 7;
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
            <div className="bg-green-500/5 border-green-500/30 border rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Restore Successful</h2>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)]"
                            >
                                ← Adjust Extraction
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {sessionStats ? `${sessionStats.filesFound.toLocaleString()} files restored · ${sessionStats.restoreRate}% restoration rate · ${sessionStats.mode === 'deep' ? 'Deep' : 'Quick'} scan` : 'Your files have been restored successfully.'}
                    </p>
                </div>
                {sessionStats && (
                    <div className="text-right text-xs text-[var(--color-text-tertiary)]">
                        <div className="font-mono text-green-400 text-base">{sessionStats.restoreRate}%</div>
                        <div>files restored</div>
                    </div>
                )}
            </div>

            {/* Cloud Retention Countdown */}
            <div className="flex items-center gap-4 p-5 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <Clock size={20} className="text-orange-400 shrink-0" />
                <div className="flex-1">
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">RestoreIt Cloud expires in {cloudDaysRemaining} days</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">Your restored files will be permanently deleted from our servers after this window unless you upgrade to Pro.</div>
                </div>
                <div className="text-3xl font-light text-orange-400 font-mono shrink-0">{cloudDaysRemaining}d</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left: Pro Protection Offer */}
                <div className="bg-[var(--color-background-elevated)] border-[var(--color-accent)]/20 border rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[var(--color-accent)]/0 via-[var(--color-accent)] to-[var(--color-accent)]/0"></div>

                    <div className="p-6 border-b border-[var(--color-accent)]/20 flex items-center gap-3">
                        <ShieldCheck size={20} className="text-[var(--color-accent)]" />
                        <h3 className="font-semibold text-[var(--color-foreground)]">Protect your devices so this never happens again.</h3>
                    </div>

                    <div className="p-6 space-y-5">
                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                            You just experienced what data loss feels like. RestoreIt Protection monitors your devices 24/7, detects early warning signs, and keeps RestoreIt Cloud always ready.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-3">
                            {benefits.map(({ icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-card)]">
                                    <span className="text-[var(--color-accent)] shrink-0 mt-0.5">{icon}</span>
                                    <div>
                                        <div className="text-sm font-medium text-[var(--color-foreground)]">{title}</div>
                                        <div className="text-xs text-[var(--color-text-tertiary)]">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--color-card-hover)] border-[var(--color-border)]">
                            <div>
                                <div className="font-semibold text-[var(--color-foreground)]">RestoreIt Pro Protection</div>
                                <div className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">Monthly · Cancel Anytime</div>
                            </div>
                            <div className="text-sm font-medium text-[var(--color-text-secondary)]">Monthly subscription</div>
                        </div>

                        <button
                            onClick={onAccept}
                            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={16} />
                            Enable Pro Protection
                        </button>

                        <button onClick={onRestart}
                            className="w-full text-center text-xs transition-colors py-2 text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)]">
                            No thanks, I understand the risk. Take me to my restored files.
                        </button>
                    </div>
                </div>

                {/* Right: Restore Readiness Dashboard Preview */}
                <div className="space-y-4">
                    <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-elevated)]">
                        <div className="text-xs uppercase tracking-widest font-bold mb-4 text-[var(--color-text-tertiary)]">Your Restore Readiness</div>
                        <div className="flex items-center gap-5 mb-5">
                            <RestoreScore score={restoreReadinessScore} />
                            <div>
                                <div className="text-lg font-semibold mb-1 text-[var(--color-foreground)]">Moderate Risk</div>
                                <div className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">Your disk health is below recommended thresholds. Pro Protection would have warned you 14 days before this failure.</div>
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
                                    <span className="text-[var(--color-text-tertiary)]">{label}</span>
                                    <span className={`font-semibold ${status === 'good' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-elevated)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={14} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">What Pro Would Have Done</div>
                        </div>
                        <ul className="space-y-2 text-xs">
                            {[
                                '⚡ Warned you 14 days before disk failure',
                                '🔒 Kept RestoreIt Cloud ready so you could skip the scan',
                                '🚀 Placed you first in the restore queue',
                                '📁 Already had your files backed in RestoreIt Cloud',
                            ].map(item => (
                                <li key={item} className="text-[var(--color-text-secondary)]">{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
