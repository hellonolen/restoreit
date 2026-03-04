"use client";
// /account/protection — Disk health monitoring & protection dashboard
import { Shield, Activity, HardDrive, AlertTriangle, CheckCircle2, Info, Bell, Cpu, Thermometer, Brain } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { DEMO_PROTECTION_STATS } from '@/lib/demo-data';

export default function ProtectionPage() {
    const { isDemo } = useUser();
    const stats = isDemo ? DEMO_PROTECTION_STATS : null;

    // If user has no protection subscription, show upsell
    if (!stats) {
        return (
            <div className="space-y-8 max-w-2xl">
                <div>
                    <h1 className="text-xl font-semibold text-white mb-1">Protection Monitoring</h1>
                    <p className="text-sm text-zinc-500">Continuous disk health monitoring and early warning system.</p>
                </div>

                <div className="p-8 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto">
                        <Shield size={28} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Enable Protection Plan</h2>
                        <p className="text-zinc-400 leading-relaxed max-w-md mx-auto">
                            Get 24/7 disk health monitoring, early warning alerts, priority restore queue, and extended RestoreIt Cloud retention for $12/month.
                        </p>
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
                    <h1 className="text-xl font-semibold text-white mb-1">Protection Monitoring</h1>
                    <p className="text-sm text-zinc-500">Live disk health analytics and early warning system.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    <Activity size={12} className="animate-pulse" /> Live Monitoring Active
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Restore Readiness Score */}
                <div className="col-span-1 p-6 rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent space-y-4">
                    <div className="flex items-center gap-2 text-[var(--color-accent)]">
                        <Brain size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Health Score</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{stats.healthScore}</span>
                        <span className="text-sm text-zinc-500">/ 100</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Your system is in optimal condition. RestoreIt Cloud synchronization is active.
                    </p>
                    <div className="pt-2">
                        <div className="flex items-center gap-2 text-[10px] text-green-400 font-medium">
                            <CheckCircle2 size={12} /> All checks passed
                        </div>
                    </div>
                </div>

                {/* Disk Stats */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <HardDrive size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Drive Health</span>
                            </div>
                            <span className="text-[10px] text-green-400 font-bold uppercase">Healthy</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Reallocated Sectors', value: '0' },
                                { label: 'Pending Sectors', value: '0' },
                                { label: 'Power-on Hours', value: '1,248h' },
                            ].map(stat => (
                                <div key={stat.label} className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">{stat.label}</span>
                                    <span className="text-zinc-300 font-mono">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Thermometer size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Temperature</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">{stats.temperature}&deg;C</span>
                        </div>
                        <div className="h-16 flex items-end gap-1 px-1">
                            {stats.thermalHistory.map((v: number, i: number) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-white/10 rounded-t-sm hover:bg-[var(--color-accent)]/40 transition-colors"
                                    style={{ height: `${(v / 40) * 100}%` }}
                                />
                            ))}
                        </div>
                        <div className="text-[10px] text-zinc-600 text-center">Last 24 hours</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Active Protection Modules */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Protection</h2>
                    <div className="space-y-2">
                        {[
                            { icon: <Cpu size={14} />, label: 'Corruption Prevention', desc: 'Real-time bit-rot monitoring' },
                            { icon: <Shield size={14} />, label: 'File Integrity Guard', desc: 'Periodic checksum verification' },
                            { icon: <Bell size={14} />, label: 'Early Warning System', desc: 'Email alerts for disk anomalies' },
                        ].map((module, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                                    {module.icon}
                                </div>
                                <div>
                                    <div className="text-white text-sm font-medium">{module.label}</div>
                                    <div className="text-zinc-500 text-xs">{module.desc}</div>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Events */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Events</h2>
                    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden divide-y divide-white/5">
                        <div className="p-4 flex gap-4">
                            <Info size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-white text-xs font-medium">Cloud Sync Complete</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">Today at 14:22 &middot; All files secured</div>
                            </div>
                        </div>
                        <div className="p-4 flex gap-4 opacity-50">
                            <AlertTriangle size={16} className="text-yellow-500/60 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-white text-xs font-medium">System Update Detected</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">Feb 24, 2026 &middot; APFS driver update verified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Shield size={24} className="text-[var(--color-accent)]" />
                    <div>
                        <div className="text-white font-semibold">Priority Restore Queue</div>
                        <div className="text-sm text-zinc-500">As a Protection Plan member, your restorations are prioritized.</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                </div>
            </div>
        </div>
    );
}
