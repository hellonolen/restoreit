"use client";
// /account/protection — Protection status (checks real subscription from D1)
import { useState, useEffect } from 'react';
import { Shield, Activity, HardDrive, AlertTriangle, CheckCircle2, Info, Bell, Cpu, Thermometer, Brain, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProtectionPage() {
    const [hasProtection, setHasProtection] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/billing')
            .then(res => res.json() as Promise<{ subscription?: { status: string } | null }>)
            .then(data => {
                setHasProtection(data.subscription?.status === 'active');
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 size={32} className="text-[var(--color-text-dim)] mx-auto mb-3 animate-spin" />
                <p className="text-[var(--color-text-tertiary)] text-sm">Loading protection status...</p>
            </div>
        );
    }

    if (!hasProtection) {
        return (
            <div className="space-y-8 max-w-2xl">
                <div>
                    <h1 className="text-xl font-semibold mb-1">Protection Monitoring</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Continuous disk health monitoring and early warning system.</p>
                </div>

                <div className="p-8 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto">
                        <Shield size={28} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Enable Protection Plan</h2>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-md mx-auto">
                            Get 24/7 disk health monitoring, early warning alerts, priority restore queue, and extended restoreit Cloud retention.
                        </p>
                        <p className="font-semibold mt-3">$29/month &middot; Cancel anytime</p>
                    </div>
                    <Link
                        href="/account/billing"
                        className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all"
                    >
                        Subscribe via Whop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold mb-1">Protection Monitoring</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Live disk health analytics and early warning system.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    <Activity size={12} className="animate-pulse" /> Protection Active
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 p-6 rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent space-y-4">
                    <div className="flex items-center gap-2 text-[var(--color-accent)]">
                        <Brain size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Status</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-green-400" />
                        <span className="text-lg font-semibold">All Systems Go</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Your Protection Plan is active. restoreit Cloud synchronization is enabled.
                    </p>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                <HardDrive size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Drive Monitoring</span>
                            </div>
                            <span className="text-[10px] text-green-400 font-bold uppercase">Active</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Disk health will be monitored during scans. SMART data collection is automatic.</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                <Thermometer size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Priority Queue</span>
                            </div>
                            <span className="text-[10px] text-green-400 font-bold uppercase">Enabled</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Your restore jobs are prioritized ahead of standard users.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider">Active Protection</h2>
                    <div className="space-y-2">
                        {[
                            { icon: <Cpu size={14} />, label: 'Corruption Prevention', desc: 'Real-time bit-rot monitoring' },
                            { icon: <Shield size={14} />, label: 'File Integrity Guard', desc: 'Periodic checksum verification' },
                            { icon: <Bell size={14} />, label: 'Early Warning System', desc: 'Email alerts for disk anomalies' },
                        ].map((module, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                                    {module.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{module.label}</div>
                                    <div className="text-[var(--color-text-tertiary)] text-xs">{module.desc}</div>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider">Recent Events</h2>
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
                        <div className="p-4 flex gap-4">
                            <Info size={16} className="text-[var(--color-text-tertiary)] shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-medium">Protection Plan Activated</div>
                                <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Your drives are now monitored</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Shield size={24} className="text-[var(--color-accent)]" />
                    <div>
                        <div className="font-semibold">Priority Restore Queue</div>
                        <div className="text-sm text-[var(--color-text-tertiary)]">As a Protection Plan member, your restorations are prioritized.</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                </div>
            </div>
        </div>
    );
}
