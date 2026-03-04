"use client";
// /account/security — Password change, active sessions, security log
import { useState } from 'react';
import { Shield, Lock, Monitor, Smartphone, History, LogOut } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export default function SecurityPage() {
    const { user } = useUser();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [activeSessions] = useState([
        { id: '1', device: 'MacBook Pro 16"', browser: 'Safari 17.2', location: 'Austin, TX', current: true, lastActive: 'Now' },
        { id: '2', device: 'iPhone 15 Pro', browser: 'RestoreIt App', location: 'Austin, TX', current: false, lastActive: '2 hours ago' },
    ]);

    const securityLog = [
        { id: 'l1', event: 'Sign in from MacBook Pro', date: 'Mar 3, 2026 14:22', status: 'success' },
        { id: 'l2', event: 'New device registered', date: 'Feb 28, 2026 09:15', status: 'warning' },
        { id: 'l3', event: 'Password updated', date: 'Jan 12, 2026 18:40', status: 'success' },
    ];

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) { setMessage('Password must be at least 8 characters.'); return; }
        if (newPassword !== confirmPassword) { setMessage('Passwords do not match.'); return; }
        setSaving(true);
        setMessage('');
        // TODO: call API to change password
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleLogoutAll = async () => {
        // TODO: call API to logout all sessions
        await new Promise(r => setTimeout(r, 500));
    };

    const inputClass = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[var(--color-accent)]/50 transition-all text-sm';

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                    <Shield size={20} className="text-[var(--color-accent)]" /> Security
                </h1>
                <p className="text-sm text-zinc-500">Manage your password, active sessions, and security settings.</p>
            </div>

            {/* Change Password */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock size={14} className="text-[var(--color-accent)]" /> Change Password
                </h2>

                {message && (
                    <div className={`p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                    <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <input
                        type="password"
                        placeholder="New password (8+ characters)"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    >
                        {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </section>

            {/* Active Sessions */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Sessions</h2>
                    <button
                        onClick={handleLogoutAll}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={12} /> Sign out all devices
                    </button>
                </div>

                <div className="space-y-2">
                    {activeSessions.map(session => (
                        <div key={session.id} className="p-4 rounded-2xl border border-white/5 bg-black/30 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${session.current ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                                {session.device.includes('iPhone') ? <Smartphone size={18} /> : <Monitor size={18} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{session.device}</span>
                                    {session.current && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                </div>
                                <div className="text-xs text-zinc-600">{session.browser} &middot; {session.location}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-600">{session.lastActive}</div>
                                {!session.current && (
                                    <button className="text-[10px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-wider mt-1 transition-colors">
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security Log */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <History size={12} /> Security Log
                </h2>
                <div className="space-y-3">
                    {securityLog.map(log => (
                        <div key={log.id} className="flex items-start gap-3">
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <div>
                                <div className="text-xs font-medium text-zinc-300">{log.event}</div>
                                <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{log.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
