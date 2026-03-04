"use client";
// /account — Profile overview (real D1 data)
import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Calendar, HardDrive, Activity } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function AccountPage() {
    const { user, isLoading } = useUser();
    const [scanCount, setScanCount] = useState(0);
    const [hasProtection, setHasProtection] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/scans').then(r => r.json() as Promise<{ success: boolean; data?: { status: string }[] }>),
            fetch('/api/billing').then(r => r.json() as Promise<{ subscription?: { status: string } | null }>),
        ]).then(([scansData, billingData]) => {
            if (scansData.success && scansData.data) {
                setScanCount(scansData.data.filter(s => s.status === 'ready').length);
            }
            if (billingData.subscription?.status === 'active') {
                setHasProtection(true);
            }
        }).catch(() => {});
    }, []);

    const displayName = isLoading ? '...' : (user?.firstName || 'Guest');
    const displayEmail = isLoading ? '' : (user?.email || '');
    const memberSince = isLoading ? '...' : (user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—');
    const initials = displayName !== '...' ? displayName.charAt(0).toUpperCase() : '?';

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold mb-1">My Account</h1>
                <p className="text-sm text-[var(--color-text-tertiary)]">Your profile, plan status, and restore summary.</p>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center text-2xl font-bold shrink-0">
                    {initials}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-lg">{displayName}</div>
                    <div className="text-[var(--color-text-tertiary)] text-sm">{displayEmail}</div>
                    <div className="flex items-center gap-2 mt-2">
                        {hasProtection ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase tracking-wider">Protection Active</span>
                        ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-card-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Free</span>
                        )}
                    </div>
                </div>
                <Link href="/account/security" className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] px-3 py-2 rounded-xl transition-all">
                    Edit Profile
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: <HardDrive size={16} />, label: 'Restores Completed', value: scanCount },
                    { icon: <Calendar size={16} />, label: 'Member Since', value: memberSince },
                    { icon: <Activity size={16} />, label: 'Protection Status', value: hasProtection ? 'Active' : 'Inactive' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
                        <div className="text-[var(--color-accent)] mb-2">{icon}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold mb-1">{label}</div>
                        <div className="text-sm font-medium">{value}</div>
                    </div>
                ))}
            </div>

            {/* Protection upsell — only show if not subscribed */}
            {!hasProtection && (
                <div className="p-6 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <ShieldCheck size={22} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold mb-1">Add Protection Plan</div>
                            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Continuous disk health monitoring, early warning alerts, priority restore queue, and extended RestoreIt Cloud retention.</div>
                        </div>
                    </div>
                    <Link href="/account/billing" className="shrink-0 bg-[var(--color-accent)] hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                        $29/mo
                    </Link>
                </div>
            )}
        </div>
    );
}
