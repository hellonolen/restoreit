"use client";

import { CreditCard, Lock, ShieldCheck, Shield } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('pro');

    const handleCheckout = () => {
        setIsProcessing(true);
        setTimeout(() => {
            // In a real app this redirects to the download or success page
            window.location.href = "/";
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col selection:bg-[#8A2BE2]/30">

            {/* Header */}
            <header className="flex items-center justify-between px-12 py-8 border-b border-[#ffffff08] bg-[#0A0A0B]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#8A2BE2] flex items-center justify-center shadow-lg shadow-[#8A2BE2]/20">
                        <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                    </div>
                    <h1 className="text-base font-semibold tracking-wide">RESTOREIT</h1>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs tracking-widest text-zinc-400 font-mono rounded-lg">
                    SECURE CHECKOUT
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex max-w-[1200px] w-full mx-auto py-16 gap-16 px-6">

                {/* Left Column: Plan Selection & Info */}
                <div className="flex-1 space-y-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <div className="text-[#8A2BE2] text-sm font-semibold tracking-widest uppercase mb-4">Choose Your Path</div>
                        <h1 className="text-4xl font-semibold mb-6">Restore Your Life</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg">
                            Select the recovery tier that fits your situation. Both versions securely scan your drive without writing over your deleted files.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-6">
                        {/* Standard Tier */}
                        <div
                            onClick={() => setSelectedPlan('standard')}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedPlan === 'standard' ? 'bg-[#8A2BE2]/5 border-[#8A2BE2] shadow-[0_0_30px_rgba(138,43,226,0.15)] ring-1 ring-[#8A2BE2]' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-medium">RestoreIt</h3>
                                <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    {selectedPlan === 'standard' && <div className="w-2.5 h-2.5 bg-[#8A2BE2] rounded-full"></div>}
                                </div>
                            </div>
                            <div className="text-3xl font-light mb-6">$89</div>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li className="flex gap-2"><span className="text-[#8A2BE2]">✓</span> Deep Drive Scanner</li>
                                <li className="flex gap-2"><span className="text-[#8A2BE2]">✓</span> Reconstructs damaged files</li>
                                <li className="flex gap-2"><span className="text-[#8A2BE2]">✓</span> Requires your own external drive</li>
                                <li className="flex gap-2 text-zinc-600"><span className="text-zinc-600">✕</span> No Cloud Vault</li>
                            </ul>
                        </div>

                        {/* Pro Tier */}
                        <div
                            onClick={() => setSelectedPlan('pro')}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${selectedPlan === 'pro' ? 'bg-[#8A2BE2]/5 border-[#8A2BE2] shadow-[0_0_30px_rgba(138,43,226,0.15)] ring-1 ring-[#8A2BE2]' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                        >
                            {selectedPlan === 'pro' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8A2BE2] to-[#6b21a8]"></div>}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-medium">RestoreIt Pro</h3>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    {selectedPlan === 'pro' && <div className="w-2.5 h-2.5 bg-[#8A2BE2] rounded-full"></div>}
                                </div>
                            </div>
                            <div className="text-3xl font-light mb-6">$249</div>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li className="flex gap-2"><span className="text-[#8A2BE2]">✓</span> Deep Drive Scanner</li>
                                <li className="flex gap-2"><span className="text-[#8A2BE2]">✓</span> Reconstructs damaged files</li>
                                <li className="flex gap-2 text-white font-medium"><span className="text-[#8A2BE2]">✓</span> Extracts to Private Cloud Vault</li>
                                <li className="flex gap-2 text-white font-medium"><span className="text-[#8A2BE2]">✓</span> No external hardware required</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#8A2BE2]/5 border border-[#8A2BE2]/20 p-5 rounded-xl flex gap-4 mt-auto">
                        <Shield size={20} className="text-[#8A2BE2] shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-white mb-1">Anti-Overwrite Guarantee</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                RestoreIt safely scans memory without writing to the disk. By extracting your files to our Cloud Vault (Pro Tier) or a separate drive (Standard Tier), you guarantee your lost files are never permanently overwritten.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Checkout Form */}
                <div className="w-[440px] shrink-0 animate-in fade-in zoom-in-95 duration-500 delay-100 flex flex-col justify-center">
                    <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 shadow-2xl relative">

                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-xl font-medium">Checkout</h2>
                            <div className="text-3xl font-light tracking-tight text-white">
                                ${selectedPlan === 'pro' ? '249' : '89'}<span className="text-zinc-500 text-base tracking-normal">.00</span>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="contact@example.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/50 transition-all font-mono text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Card Details</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                                        <CreditCard size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-black/50 border border-white/10 rounded-t-lg p-4 pl-12 text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/50 transition-all font-mono text-sm"
                                        required
                                    />
                                    <div className="flex bg-black/50 border border-t-0 border-white/10 rounded-b-lg overflow-hidden">
                                        <input
                                            type="text"
                                            placeholder="MM / YY"
                                            className="w-1/2 bg-transparent border-r border-white/10 p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/50 transition-all font-mono text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="CVC"
                                            className="w-1/2 bg-transparent p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/50 transition-all font-mono text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-[#8A2BE2] hover:bg-[#7e22ce] text-white px-5 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(138,43,226,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Lock size={16} /> Pay ${selectedPlan === 'pro' ? '249' : '89'}.00
                                    </span>
                                )}
                            </button>

                        </form>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
                            <ShieldCheck size={14} className="text-[#8A2BE2]" />
                            Secure Checkout
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
