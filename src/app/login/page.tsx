"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
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
        // Hydration safety
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError('Credential pair required for forensic access.'); return; }
        setError('');
        setLoading(true);

        // Simulate high-fidelity auth delay
        await new Promise(r => setTimeout(r, 1800));

        // Set mock session cookie for middleware
        document.cookie = "restoreit_session=true; path=/; max-age=3600";

        setLoading(false);
        router.push('/account');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-300 font-sans flex relative overflow-hidden">

            {/* Left Panel: Forensic Branding & Stats */}
            <div className="hidden lg:flex w-1/2 relative flex-col p-16 justify-between border-r border-white/5 bg-black/40">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[#8A2BE2]/20 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4B0082]/20 blur-[120px] rounded-full animate-pulse duration-[5000ms]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="group flex items-center gap-4 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-[#8A2BE2] flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.4)] group-hover:scale-105 transition-transform duration-300">
                            <div className="w-3 h-3 bg-white rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                        </div>
                        <span className="text-xl font-black tracking-[0.3em] text-white">RESTOREIT</span>
                    </Link>

                    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-[#8A2BE2] text-[10px] font-black uppercase tracking-widest">
                            <Shield size={10} strokeWidth={3} /> Certified Forensic Node
                        </div>
                        <h1 className="text-7xl font-black text-white leading-[1] tracking-tighter">
                            Backend <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#B066FF]">Extraction Gate.</span>
                        </h1>
                        <p className="text-xl text-zinc-500 leading-relaxed max-w-md font-medium">
                            Authorized personnel only. Accessing the Cloud Vault reconstruction pool requires workstation-level forensic credentials.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <Shield className="text-[#8A2BE2] mb-6" size={40} />
                                <span className="text-[10px] text-green-500 font-black">ENCRYPTED</span>
                            </div>
                            <div className="text-2xl font-black text-white">AES-256</div>
                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Protocol Standard</div>
                        </div>
                        <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <CheckCircle2 className="text-[#8A2BE2]" size={18} />
                                <span className="text-[10px] text-blue-400 font-black">ACTIVE</span>
                            </div>
                            <div className="text-2xl font-black text-white">Zero-Write</div>
                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Disk Integrity</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 opacity-30">
                        <div className="text-[9px] font-black text-white uppercase tracking-[0.2em]">© 2026 FORENSIC PLATFORMS</div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <div className="text-[9px] font-black text-white uppercase tracking-[0.2em]">SESS CODE: BK-4922</div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex-1 flex flex-col relative justify-center items-center p-8 bg-[#050506]">
                <div className="lg:hidden absolute top-8 left-8">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#8A2BE2] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-md font-black tracking-widest text-white">RESTOREIT</span>
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-12">
                    <div className="space-y-4">
                        <div className="w-8 h-8 rounded-lg bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#8A2BE2] rounded-sm animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">Sign In</h2>
                        <p className="text-zinc-500 font-medium tracking-tight">Access the RestoreIt Recovery Dashboard and Cloud Vault Archive.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in zoom-in-95">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Forensic Email</label>
                                <div className="relative group/input">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#8A2BE2] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="analyst@restoreit.app"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-zinc-800 outline-none focus:border-[#8A2BE2]/50 focus:bg-white/[0.04] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Access Key</label>
                                    <button type="button" className="text-[10px] font-bold text-[#8A2BE2]/60 hover:text-[#8A2BE2] transition-colors uppercase tracking-widest">Forgot Code?</button>
                                </div>
                                <div className="relative group/input">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#8A2BE2] transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder-zinc-800 outline-none focus:border-[#8A2BE2]/50 focus:bg-white/[0.04] transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-[#8A2BE2] hover:bg-[#7e22ce] disabled:opacity-50 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#8A2BE2]/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Bypassing Firewall...
                                </div>
                            ) : (
                                <>Authenticate Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600">Need helping connecting?</span>
                            <Link href="/support" className="text-xs font-bold text-[#8A2BE2] hover:underline">Forensic Support →</Link>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="/" className="text-zinc-600 hover:text-white transition-colors ml-auto">← Back to Site</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
