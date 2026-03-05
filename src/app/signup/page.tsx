"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
    return <Suspense><SignupContent /></Suspense>;
}

function SignupContent() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/restore';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !email || !password) { setError('All fields are required.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, email, password }),
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({ error: 'Signup failed' }))) as { error?: string };
                setError(data.error || 'Could not create account.');
                setLoading(false);
                return;
            }

            router.push(redirectTo);
        } catch {
            setError('Connection error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Panel */}
            <div className="hidden lg:flex w-[45%] relative flex-col p-20 justify-between overflow-hidden border-r border-[var(--color-border)]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent blur-[120px]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="group flex items-center gap-4 mb-24 transition-all duration-700">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.3)] group-hover:scale-105 transition-transform">
                            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-xl font-black tracking-[0.3em] text-[var(--color-foreground)]">restoreit</span>
                    </Link>

                    <div className="space-y-8 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-card-hover)] border border-[var(--color-border)] text-[var(--color-text-dim)] text-[9px] font-black uppercase tracking-[0.2em]">
                            <Shield size={10} strokeWidth={3} /> Secure Cloud Restoration
                        </div>
                        <h1 className="text-6xl font-black leading-[1.05] tracking-tighter">
                            Cloud-based <br />
                            <span className="text-[var(--color-text-dim)]">restoration.</span>
                        </h1>
                        <p className="text-lg text-[var(--color-text-tertiary)] leading-relaxed font-medium max-w-sm">
                            Create your account to get started.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="text-[9px] font-black text-[var(--color-text-dim)] uppercase tracking-[0.25em]">&copy; 2026 restoreit</div>
                </div>
            </div>

            {/* Right Panel: Signup Form */}
            <div className="flex-1 flex flex-col bg-[var(--color-background)] relative p-8 lg:p-24 items-center justify-center transition-colors duration-300">
                <div className="w-full max-w-md space-y-10">
                    <div className="w-12 h-12 rounded-[14px] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                        <User size={18} className="text-[var(--color-accent)]" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-5xl font-black tracking-tighter">Create Account</h2>
                        <p className="text-[var(--color-text-tertiary)] text-lg font-medium leading-relaxed max-w-sm">
                            Start restoring your deleted files in minutes.
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
                                <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider ml-1">First Name</label>
                                <input type="text" placeholder="Your first name" value={firstName} onChange={e => setFirstName(e.target.value)}
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/[0.02] transition-all font-medium" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider ml-1">Email</label>
                                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/[0.02] transition-all font-medium" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider ml-1">Password</label>
                                <input type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/[0.02] transition-all font-medium" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full h-16 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${loading
                                ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed border border-[var(--color-border)]'
                                : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}>
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-foreground)] rounded-full animate-spin" /> Creating account...</>
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-dim)]">Already have an account?</span>
                        <Link href={redirectTo !== '/restore' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'} className="text-sm font-bold text-[var(--color-accent)] flex items-center gap-2 group">
                            Sign in <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
