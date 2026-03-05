"use client";

import { Suspense, useState } from 'react';
import { Shield, ArrowRight, Check, Cloud, HardDrive, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
    const [isProcessing, setIsProcessing] = useState(false);
    const searchParams = useSearchParams();
    const tierParam = searchParams.get('tier');
    const initialTier = tierParam === 'scan' ? 'scan' : 'pro';
    const [selectedPlan, setSelectedPlan] = useState<'scan' | 'pro'>(initialTier);
    const [cloudStorage, setCloudStorage] = useState(false);
    const [error, setError] = useState('');
    const rawDevices = Number(searchParams.get('devices') ?? '1');
    const devices = Math.max(1, Math.min(5, Math.floor(rawDevices) || 1));

    const planPrice = selectedPlan === 'pro' ? 249 : 89;
    const storagePrice = cloudStorage ? 79 : 0;
    const totalPrice = (planPrice + storagePrice) * devices;

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier: selectedPlan,
                    devices,
                    addons: cloudStorage ? ['cloud_storage'] : [],
                }),
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
            id: 'scan' as const,
            name: 'restoreit',
            price: 89,
            features: [
                { text: 'Deep drive scanner', included: true },
                { text: 'Reconstructs damaged files', included: true },
                { text: 'Restored files via secure link', included: true },
                { text: 'Extended Cloud retention', included: false },
            ],
            icon: <HardDrive size={20} />,
        },
        {
            id: 'pro' as const,
            name: 'restoreit Pro',
            price: 249,
            features: [
                { text: 'Deep drive scanner', included: true },
                { text: 'Reconstructs damaged files', included: true },
                { text: 'restoreit Cloud storage included', included: true },
                { text: 'No external hardware required', included: true },
            ],
            icon: <Cloud size={20} />,
            recommended: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-[var(--color-border)]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                        <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
                    </div>
                    <span className="text-base font-bold tracking-wide">restoreit</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card-hover)] border border-[var(--color-border)] text-xs tracking-widest text-[var(--color-text-secondary)] font-medium rounded-lg">
                    <Lock size={12} /> SECURE CHECKOUT
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row max-w-[1100px] w-full mx-auto py-12 lg:py-20 gap-12 lg:gap-16 px-6">
                {/* Left: Plan Selection */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-3">Choose Your Plan</h1>
                        <p className="text-[var(--color-text-tertiary)] text-lg leading-relaxed max-w-lg">
                            Both plans scan your drive safely without overwriting deleted files. Pick the option that works best for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${selectedPlan === plan.id
                                    ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                                    : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]'
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-800" />
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedPlan === plan.id
                                            ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                                            : 'bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                                            }`}>
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{plan.name}</h3>
                                            {plan.recommended && (
                                                <span className="text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-wider">Recommended</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border-focus)] flex items-center justify-center">
                                        {selectedPlan === plan.id && <div className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full" />}
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-5">
                                    ${plan.price * devices}<span className="text-[var(--color-text-dim)] text-base font-normal">.00</span>
                                    {devices > 1 && (
                                        <div className="text-xs text-[var(--color-text-tertiary)] font-normal mt-1">${plan.price} x {devices} devices</div>
                                    )}
                                </div>
                                <ul className="space-y-2.5 text-sm">
                                    {plan.features.map((f) => (
                                        <li key={f.text} className={`flex gap-2 ${f.included ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-disabled-text)]'}`}>
                                            {f.included ? (
                                                <Check size={14} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                                            ) : (
                                                <span className="text-[var(--color-disabled-text)] mt-0.5 shrink-0">&#x2715;</span>
                                            )}
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>

                    {/* Cloud Storage Add-on */}
                    <button
                        type="button"
                        onClick={() => setCloudStorage(!cloudStorage)}
                        className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${cloudStorage
                            ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                            : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${cloudStorage
                            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                            : 'border-[var(--color-border-focus)]'
                            }`}>
                            {cloudStorage && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Cloud size={16} className={cloudStorage ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'} />
                                <span className="text-sm font-bold">Add restoreit Cloud Storage</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
                                Keep your recovered files safe in the cloud. Access them anytime, from any device.
                            </p>
                        </div>
                        <div className="text-lg font-bold shrink-0">
                            +$79<span className="text-[var(--color-text-dim)] text-xs font-normal">.00</span>
                        </div>
                    </button>

                    <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-5 rounded-xl flex gap-4">
                        <Shield size={20} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold mb-1">Safe Restoration Guarantee</h4>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                restoreit scans your drive without writing to disk. Your recovered files are stored securely in restoreit Cloud.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Checkout Summary */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-[var(--color-background-elevated)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl sticky top-8 space-y-6">
                        <div className="flex items-end justify-between">
                            <h2 className="text-xl font-bold">Order Summary</h2>
                            <div className="text-3xl font-bold tracking-tight">
                                ${totalPrice}<span className="text-[var(--color-text-tertiary)] text-base">.00</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-[var(--color-text-secondary)]">
                                <span>{selectedPlan === 'pro' ? 'restoreit Pro' : 'restoreit'}{devices > 1 ? ` x ${devices} devices` : ''}</span>
                                <span className="text-[var(--color-foreground)]">${planPrice * devices}.00</span>
                            </div>
                            {cloudStorage && (
                                <div className="flex justify-between text-[var(--color-text-secondary)]">
                                    <span>Cloud Storage{devices > 1 ? ` x ${devices}` : ''}</span>
                                    <span className="text-[var(--color-foreground)]">${storagePrice * devices}.00</span>
                                </div>
                            )}
                            {devices > 1 && (
                                <div className="flex justify-between text-[var(--color-text-dim)] text-xs">
                                    <span>${planPrice + storagePrice} per device</span>
                                    <span>{devices} devices</span>
                                </div>
                            )}
                            <div className="border-t border-[var(--color-border-subtle)] pt-3 flex justify-between font-bold">
                                <span>Total</span>
                                <span>${totalPrice}.00</span>
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
                            className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${isProcessing
                                ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed border border-[var(--color-border-subtle)]'
                                : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-foreground)] rounded-full animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                <>Complete Purchase <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p className="text-[10px] text-[var(--color-text-dim)] text-center leading-relaxed">
                            You&apos;ll be securely redirected to Whop to complete payment. No card details are stored on our servers.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
