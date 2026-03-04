"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError('Credential pair required for forensic access.'); return; }
        setError('');
        setLoading(true);
        // Simulation of forensic extraction auth
        await new Promise(r => setTimeout(r, 1800));
        document.cookie = "restoreit_session=true; path=/; max-age=3600";
        setLoading(false);
        router.push('/');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-black relative selection:bg-[#8A2BE2]/30">
            {/* Left Panel: Forensic Branding */}
            <div className="hidden lg:flex w-[45%] relative flex-col p-20 justify-between overflow-hidden border-r border-[#ffffff08]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-gradient-to-br from-[#8A2BE2]/10 to-transparent blur-[120px]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="group flex items-center gap-4 mb-24 transition-all duration-700">
                        <div className="w-10 h-10 rounded-xl bg-[#8A2BE2] flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.3)] group-hover:scale-105 transition-transform">
                            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-xl font-black tracking-[0.4em] text-white">restoreit</span>
                    </Link>

                    <div className="space-y-8 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                            <Shield size={10} strokeWidth={3} /> Certified Forensic Node
                        </div>
                        <h1 className="text-7xl font-sans font-black text-white leading-[1.05] tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
                            restoreit <br />
                            <span className="text-zinc-600">restoreit.</span>
                        </h1>
                        <p className="text-lg text-zinc-500 leading-relaxed font-medium max-w-sm">
                            Accessing the restoreit restore pool requires authorized workstation credentials and encrypted relay handshake.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">© 2026 restoreit · BK-4922</div>
                </div>
            </div>

            {/* Right Panel: Focused Sign In (Matches User Screenshot) */}
            <div className="flex-1 flex flex-col bg-black relative p-8 lg:p-24 items-center justify-center border-l border-white/[0.04]">
                <div className="w-full max-w-md space-y-12">
                    {/* Brand Icon (Purple Dot) */}
                    <div className="w-12 h-12 rounded-[14px] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#8A2BE2] animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-6xl font-black text-white tracking-tighter">Sign In</h2>
                        <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-sm">
                            Access the restoreit Restore Dashboard and restoreit Archive.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in-95">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Forensic Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="analyst@restoreit.app"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-sm text-white placeholder-zinc-800 outline-none focus:border-[#8A2BE2]/50 focus:bg-[#8A2BE2]/[0.02] transition-all font-medium"
                                    />
                                    <Mail size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-zinc-600 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Access Key</label>
                                    <button type="button" className="text-[10px] font-black text-[#8A2BE2] hover:text-[#B066FF] transition-all uppercase tracking-[0.15em]">Forgot Code?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-5 text-sm text-white placeholder-zinc-800 outline-none focus:border-[#8A2BE2]/50 focus:bg-[#8A2BE2]/[0.02] transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-zinc-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-20 rounded-3xl text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${loading
                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                : 'bg-[#8A2BE2] hover:bg-[#7e22ce] text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                    Handshaking
                                </>
                            ) : (
                                <>Authenticate Access <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-12 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-700">Need helping connecting?</span>
                        <Link href="/support" className="text-[11px] font-black text-[#8A2BE2] flex items-center gap-2 group">
                            Forensic Support <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
