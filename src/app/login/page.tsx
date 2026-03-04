"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError('Please enter your email and password.'); return; }
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({ error: 'Login failed' }))) as { error?: string };
                setError(data.error || 'Invalid email or password.');
                setLoading(false);
                return;
            }

            router.push('/restore');
        } catch {
            setError('Connection error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black relative selection:bg-[var(--color-accent)]/30">
            <SiteHeader />
            <div className="flex flex-col lg:flex-row min-h-screen pt-[73px]">
            {/* Left Panel: Brand Messaging */}
            <div className="hidden lg:flex w-[45%] relative flex-col p-20 justify-between overflow-hidden border-r border-[#ffffff08]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent blur-[120px]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="group flex items-center gap-4 mb-24 transition-all duration-700">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.3)] group-hover:scale-105 transition-transform">
                            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-xl font-black tracking-[0.3em] text-white">RESTOREIT</span>
                    </Link>

                    <div className="space-y-8 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                            <Shield size={10} strokeWidth={3} /> Secure Cloud Restoration
                        </div>
                        <h1 className="text-6xl font-black text-white leading-[1.05] tracking-tighter">
                            Restore your <br />
                            <span className="text-zinc-600">deleted files.</span>
                        </h1>
                        <p className="text-lg text-zinc-500 leading-relaxed font-medium max-w-sm">
                            No software installed on your drive. No risk of overwriting your data. Just safe, cloud-based restoration.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                'Zero-install restoration — nothing written to your disk',
                                'Preview files before you pay',
                                'AES-256 encrypted transfer',
                            ].map(feature => (
                                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">&copy; 2026 RestoreIt</div>
                </div>
            </div>

            {/* Right Panel: Sign In Form */}
            <div className="flex-1 flex flex-col bg-black relative p-8 lg:p-24 items-center justify-center">
                <div className="w-full max-w-md space-y-10">
                    {/* Brand Icon */}
                    <div className="w-12 h-12 rounded-[14px] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-5xl font-black text-white tracking-tighter">Sign In</h2>
                        <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-sm">
                            Access your dashboard and RestoreIt Cloud.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-sm text-white placeholder-zinc-700 outline-none focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/[0.02] transition-all font-medium"
                                    />
                                    <Mail size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-zinc-500 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
                                    <button type="button" className="text-xs font-bold text-[var(--color-accent)] hover:opacity-80 transition-all">Forgot password?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-sm text-white placeholder-zinc-700 outline-none focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/[0.02] transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-16 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${loading
                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Don&apos;t have an account?</span>
                        <Link href="/signup" className="text-sm font-bold text-[var(--color-accent)] flex items-center gap-2 group">
                            Create account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
