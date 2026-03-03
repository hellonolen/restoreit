"use client";

import { useState } from 'react';
import { Shield, Lock, Smartphone, Key, History, SmartphoneIcon as SmartphoneActive, Monitor, ChevronRight } from 'lucide-react';

export default function SecurityPage() {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [activeSessions] = useState([
        { id: '1', device: 'MacBook Pro 16"', browser: 'Safari 17.2', location: 'Austin, TX', active: true, registeredAt: 'Mar 3, 2026' },
        { id: '2', device: 'iPhone 15 Pro', browser: 'RestoreIt App', location: 'Austin, TX', active: false, registeredAt: 'Feb 28, 2026' },
    ]);

    const securityLog = [
        { id: 'l1', event: 'Vault Access Key Generated', date: 'Mar 3, 2026 14:22', status: 'success' },
        { id: 'l2', event: 'New Device Registered', date: 'Feb 28, 2026 09:15', status: 'warning' },
        { id: 'l3', event: 'Password Updated', date: 'Jan 12, 2026 18:40', status: 'success' },
    ];


    return (
        <div className="space-y-12 max-w-4xl animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                    <Shield className="text-[#8A2BE2]" size={28} /> Forensic Security Center
                </h1>
                <p className="text-zinc-500 text-lg">Manage forensic session integrity, 2FA, and Cloud Vault access credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Core Security Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 2FA Protection Section */}
                    <section className="p-8 rounded-[32px] border border-white/10 bg-black/40 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8A2BE2]/5 blur-3xl rounded-full" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Smartphone size={20} className="text-[#8A2BE2]" /> Multi-Factor Authentication
                                </h2>
                                <p className="text-sm text-zinc-500">Secure your recovery vault with biometric or token-based verification.</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${twoFAEnabled ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                {twoFAEnabled ? 'Active Protection' : 'Defensive Gap Detected'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-5 rounded-2xl border transition-all cursor-pointer ${twoFAEnabled ? 'border-[#8A2BE2]/50 bg-[#8A2BE2]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#8A2BE2] border border-white/10">
                                        <SmartphoneActive size={20} />
                                    </div>
                                    <div className="text-sm font-bold text-white">Authenticator App</div>
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed mb-4">Use Google Authenticator or 1Password for forensic-grade TOTP tokens.</p>
                                <button onClick={() => setTwoFAEnabled(!twoFAEnabled)} className="text-[10px] font-black text-[#8A2BE2] uppercase tracking-[0.2em] hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                    {twoFAEnabled ? 'Deactivate Session' : 'Begin Configuration'} <ChevronRight size={12} />
                                </button>
                            </div>

                            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] opacity-50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-zinc-600 border border-white/10">
                                        <Key size={20} />
                                    </div>
                                    <div className="text-sm font-bold text-zinc-400">Hardware Security Key</div>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed mb-4">YubiKey and Titan Security Keys for absolute physical session hardware binding.</p>
                                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Enterprise Only</span>
                            </div>
                        </div>
                    </section>

                    {/* Active Sessions */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">Active Forensic Sessions</h2>
                            <button className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">Terminate All Sessions</button>
                        </div>

                        <div className="space-y-2">
                            {activeSessions.map(session => (
                                <div key={session.id} className="p-5 rounded-2xl border border-white/5 bg-black/40 flex items-center gap-4 group hover:border-white/10 transition-colors">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${session.active ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/30 text-[#8A2BE2]' : 'bg-white/5 border-white/10 text-zinc-700'}`}>
                                        {session.device.includes('iPhone') ? <SmartphoneActive size={20} /> : <Monitor size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{session.device}</span>
                                            {session.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                        </div>
                                        <div className="text-xs text-zinc-600">{session.browser} • {session.location}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-zinc-700 uppercase mb-1">{session.registeredAt}</div>
                                        {!session.active && (
                                            <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-tighter">Sign Out</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Key Management & Status */}
                <div className="space-y-8">

                    {/* Vault Access Credentials */}
                    <section className="p-8 rounded-[32px] bg-gradient-to-br from-[#8A2BE2]/20 to-black border border-[#8A2BE2]/30 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#8A2BE2] flex items-center justify-center shadow-lg shadow-[#8A2BE2]/20">
                            <Lock className="text-white" size={24} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white tracking-tight">Vault Credentials</h2>
                            <p className="text-xs text-[#8A2BE2] font-medium leading-relaxed uppercase tracking-wide">RestoreIt Forensic Passkeys</p>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Generating a new forensic key will invalidate all existing Cloud Vault links. Download your new key file immediately.
                        </p>
                        <button className="w-full bg-white text-black py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.98]">
                            Regenerate Key
                        </button>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest justify-center">
                            <History size={12} /> Last rotated: 4h ago
                        </div>
                    </section>

                    {/* Security Events Log */}
                    <section className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-4">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Event Audit Trail</h2>
                        <div className="space-y-4">
                            {securityLog.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                    <div>
                                        <div className="text-xs font-bold text-zinc-300">{log.event}</div>
                                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{log.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pro Protection Notice */}
                    <div className="p-6 rounded-2xl bg-[#8A2BE2]/5 border border-[#8A2BE2]/20 flex items-start gap-4">
                        <Shield className="text-[#8A2BE2] shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-white uppercase tracking-widest">Advanced Threat Guard</div>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">Your Protection Plan includes 24/7 forensic monitoring of these access points.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
