"use client";
// /account — Profile overview
import { ShieldCheck, CheckCircle2, Calendar, HardDrive, Activity } from 'lucide-react';
import Link from 'next/link';

const mockUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    joinedAt: 'January 14, 2026',
    sessionsCompleted: 3,
    plan: 'RestoreIt Pro',
    proProtection: false,
};

export default function AccountPage() {
    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold text-white mb-1">My Account</h1>
                <p className="text-sm text-zinc-500">Your profile, plan status, and recovery summary.</p>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#8A2BE2] flex items-center justify-center text-2xl font-bold shrink-0">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                    <div className="text-white font-semibold text-lg">{mockUser.name}</div>
                    <div className="text-zinc-500 text-sm">{mockUser.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#8A2BE2] font-bold uppercase tracking-wider">{mockUser.plan}</span>
                    </div>
                </div>
                <button className="text-xs text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all">Edit Profile</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: <HardDrive size={16} />, label: 'Recoveries Completed', value: mockUser.sessionsCompleted },
                    { icon: <Calendar size={16} />, label: 'Member Since', value: mockUser.joinedAt },
                    { icon: <Activity size={16} />, label: 'Protection Status', value: mockUser.proProtection ? 'Active' : 'Inactive' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="p-4 rounded-xl border border-white/8 bg-black/20">
                        <div className="text-[#8A2BE2] mb-2">{icon}</div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">{label}</div>
                        <div className="text-white text-sm font-medium">{value}</div>
                    </div>
                ))}
            </div>

            {/* Protection upsell if not subscribed */}
            {!mockUser.proProtection && (
                <div className="p-6 rounded-2xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <ShieldCheck size={22} className="text-[#8A2BE2] shrink-0 mt-0.5" />
                        <div>
                            <div className="text-white font-semibold mb-1">Add Protection Plan — $12/month</div>
                            <div className="text-sm text-zinc-400 leading-relaxed">Continuous disk health monitoring, early warning alerts, priority recovery queue, and extended Cloud Vault retention.</div>
                        </div>
                    </div>
                    <Link href="/account/billing" className="shrink-0 bg-[#8A2BE2] hover:bg-[#7e22ce] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                        Enable →
                    </Link>
                </div>
            )}

            {mockUser.proProtection && (
                <div className="p-5 rounded-2xl border border-green-500/30 bg-green-500/5 flex items-center gap-4">
                    <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                    <div>
                        <div className="text-white font-semibold mb-0.5">Protection Plan Active</div>
                        <div className="text-sm text-zinc-400">Your devices are being monitored. Next billing: April 3, 2026.</div>
                    </div>
                </div>
            )}
        </div>
    );
}
