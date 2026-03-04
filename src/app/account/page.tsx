"use client";
// /account — Profile overview
import { ShieldCheck, CheckCircle2, Calendar, HardDrive, Activity } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { DEMO_USER, DEMO_SCAN_HISTORY } from '@/lib/demo-data';

export default function AccountPage() {
    const { user, isDemo, isLoading } = useUser();

    const displayName = isLoading ? '...' : (user?.firstName || DEMO_USER.firstName);
    const displayEmail = isLoading ? '' : (user?.email || DEMO_USER.email);
    const sessionsCompleted = isDemo ? DEMO_SCAN_HISTORY.filter(s => s.status === 'completed').length : 0;
    const memberSince = isLoading ? '...' : (user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'January 14, 2026');
    const initials = displayName !== '...' ? displayName.charAt(0).toUpperCase() : '?';

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold text-white mb-1">My Account</h1>
                <p className="text-sm text-zinc-500">Your profile, plan status, and restore summary.</p>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center text-2xl font-bold shrink-0">
                    {initials}
                </div>
                <div className="flex-1">
                    <div className="text-white font-semibold text-lg">{displayName}</div>
                    <div className="text-zinc-500 text-sm">{displayEmail}</div>
                    <div className="flex items-center gap-2 mt-2">
                        {isDemo && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-wider">Free</span>
                        )}
                    </div>
                </div>
                <Link href="/account/security" className="text-xs text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all">
                    Edit Profile
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: <HardDrive size={16} />, label: 'Restores Completed', value: sessionsCompleted },
                    { icon: <Calendar size={16} />, label: 'Member Since', value: memberSince },
                    { icon: <Activity size={16} />, label: 'Protection Status', value: 'Inactive' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="p-4 rounded-xl border border-white/[0.08] bg-black/20">
                        <div className="text-[var(--color-accent)] mb-2">{icon}</div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">{label}</div>
                        <div className="text-white text-sm font-medium">{value}</div>
                    </div>
                ))}
            </div>

            {/* Protection upsell */}
            <div className="p-6 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <ShieldCheck size={22} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div>
                        <div className="text-white font-semibold mb-1">Add Protection Plan — $12/month</div>
                        <div className="text-sm text-zinc-400 leading-relaxed">Continuous disk health monitoring, early warning alerts, priority restore queue, and extended RestoreIt Cloud retention.</div>
                    </div>
                </div>
                <Link href="/account/billing" className="shrink-0 bg-[var(--color-accent)] hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                    Enable
                </Link>
            </div>
        </div>
    );
}
