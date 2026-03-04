"use client";

import { useState } from 'react';
import { Shield, ArrowRight, Check, Cloud, HardDrive, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('pro');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: selectedPlan }),
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({ error: 'Checkout failed' }))) as { error?: string };
                setError(data.error || 'Could not start checkout.');
                setIsProcessing(false);
                return;
            }

            const { url } = (await res.json()) as { url?: string };
            if (url) {
                window.location.href = url;
            } else {
                setError('No checkout URL returned.');
                setIsProcessing(false);
            }
        } catch {
            setError('Connection error. Please try again.');
            setIsProcessing(false);
        }
    };

    const plans = [
        {
            id: 'standard' as const,
            name: 'RestoreIt',
            price: 89,
            features: [
                { text: 'Deep drive scanner', included: true },
                { text: 'Reconstructs damaged files', included: true },
                { text: 'Download to your own drive', included: true },
                { text: 'RestoreIt Cloud storage', included: false },
            ],
            icon: <HardDrive size={20} />,
        },
        {
            id: 'pro' as const,
            name: 'RestoreIt Pro',
            price: 249,
            features: [
                { text: 'Deep drive scanner', included: true },
                { text: 'Reconstructs damaged files', included: true },
                { text: 'RestoreIt Cloud storage included', included: true },
                { text: 'No external hardware required', included: true },
            ],
            icon: <Cloud size={20} />,
            recommended: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col selection:bg-[var(--color-accent)]/30">
            {/* Header */}
            <header className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-[#ffffff08]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                        <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                    </div>
                    <span className="text-base font-bold tracking-wide">RESTOREIT</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs tracking-widest text-zinc-400 font-medium rounded-lg">
                    <Lock size={12} /> SECURE CHECKOUT
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row max-w-[1100px] w-full mx-auto py-12 lg:py-20 gap-12 lg:gap-16 px-6">
                {/* Left: Plan Selection */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Choose Your Plan</h1>
                        <p className="text-zinc-500 text-lg leading-relaxed max-w-lg">
                            Both plans scan your drive safely without overwriting deleted files. Pick the option that works best for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${
                                    selectedPlan === plan.id
                                        ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                                        : 'bg-black/40 border-white/10 hover:border-white/20'
                                }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-800" />
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                            selectedPlan === plan.id
                                                ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                                                : 'bg-white/5 border-white/10 text-zinc-500'
                                        }`}>
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                            {plan.recommended && (
                                                <span className="text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-wider">Recommended</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
                                        {selectedPlan === plan.id && <div className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full" />}
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-5">${plan.price}<span className="text-zinc-600 text-base font-normal">.00</span></div>
                                <ul className="space-y-2.5 text-sm">
                                    {plan.features.map((f) => (
                                        <li key={f.text} className={`flex gap-2 ${f.included ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                            {f.included ? (
                                                <Check size={14} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                                            ) : (
                                                <span className="text-zinc-700 mt-0.5 shrink-0">&#x2715;</span>
                                            )}
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>

                    <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-5 rounded-xl flex gap-4">
                        <Shield size={20} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Safe Restoration Guarantee</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                RestoreIt scans your drive without writing to disk. Pro tier stores files in RestoreIt Cloud. Standard tier downloads to your own drive.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Checkout Summary */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 shadow-2xl sticky top-8 space-y-6">
                        <div className="flex items-end justify-between">
                            <h2 className="text-xl font-bold">Order Summary</h2>
                            <div className="text-3xl font-bold tracking-tight">
                                ${selectedPlan === 'pro' ? '249' : '89'}<span className="text-zinc-500 text-base">.00</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-400">
                                <span>{selectedPlan === 'pro' ? 'RestoreIt Pro' : 'RestoreIt'}</span>
                                <span className="text-white">${selectedPlan === 'pro' ? '249' : '89'}.00</span>
                            </div>
                            <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white">
                                <span>Total</span>
                                <span>${selectedPlan === 'pro' ? '249' : '89'}.00</span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                                isProcessing
                                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                    : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                <>Pay with Whop <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                            You&apos;ll be securely redirected to Whop to complete payment. No card details are stored on our servers.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
