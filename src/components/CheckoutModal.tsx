// CheckoutModal: tier limits, refund policy, restore guarantee, storage info
"use client";

import { useRef, useState } from 'react';
import { X, Lock, ShieldCheck, HardDrive, Cloud, Star, Shield } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface CheckoutModalProps {
    onClose: () => void;
    onSuccess: () => void;
    totalFiles: number;
    dataSize: number;
    devices?: number;
}

function formatBytes(b: number): string {
    if (b === 0) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

export default function CheckoutModal({ onClose, onSuccess, totalFiles, dataSize, devices = 1 }: CheckoutModalProps) {
    const deviceCount = Math.max(1, Math.min(5, Math.floor(devices) || 1));
    const [selectedTier, setSelectedTier] = useState<'standard' | 'pro'>('standard');
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const tiers = [
        {
            id: 'standard' as const,
            name: 'Standard',
            price: 89,
            scanLimit: 'Single restoration',
            storage: 'Your own drive required',
            retention: 'Immediate transfer only',
            requiresExternal: true,
            features: [
                'Full cloud restoration',
                'Restored file bundle download',
                'Selective file restoration',
                '7-day support window',
            ],
        },
        {
            id: 'pro' as const,
            name: 'Pro',
            price: 249,
            scanLimit: 'Unlimited re-downloads',
            storage: '500 GB cloud storage included',
            retention: '7-day RestoreIt Cloud retention',
            requiresExternal: false,
            features: [
                'Everything in Standard',
                '500 GB private cloud storage',
                'Direct secure download — no external drive needed',
                '7-day encrypted cloud retention',
                'Priority restore queue',
                'Extended file history',
            ],
        },
    ];

    const selected = tiers.find(t => t.id === selectedTier)!;

    const handlePaySecurely = async () => {
        setIsRedirecting(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: selectedTier, devices: deviceCount }),
            });
            const data = (await res.json()) as { url?: string };
            if (data.url) {
                window.location.href = data.url;
            } else {
                onSuccess();
            }
        } catch {
            onSuccess();
        } finally {
            setIsRedirecting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[var(--color-overlay)] backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Secure Checkout">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-[var(--color-background-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto"
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[var(--color-accent)]" size={20} />
                        <h2 className="font-semibold">Secure Checkout</h2>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Encrypted</span>
                    </div>
                    <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-card-hover)]" aria-label="Close checkout">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 lg:p-8 space-y-6">

                    {/* Tier Selector */}
                    <div>
                        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-tertiary)] mb-4">Choose Your Plan</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tiers.map(tier => (
                                <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                                    className={`p-5 rounded-xl border text-left transition-all ${selectedTier === tier.id
                                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]'
                                        : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-border-focus)]'
                                        }`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-semibold text-sm">{tier.name}</div>
                                            <div className="text-2xl font-light mt-1">{tier.price * deviceCount}<span className="text-[var(--color-text-tertiary)] text-sm">.00</span></div>
                                        {deviceCount > 1 && <div className="text-[10px] text-[var(--color-text-tertiary)]">${tier.price} x {deviceCount} devices</div>}
                                        </div>
                                        {tier.id === 'pro' && <Star size={14} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />}
                                        {selectedTier === tier.id && <div className="w-4 h-4 rounded-full bg-[var(--color-accent)] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>}
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-[var(--color-text-tertiary)]">
                                        {tier.features.slice(0, 3).map(f => (
                                            <li key={f} className="flex items-start gap-2">
                                                <span className="text-[var(--color-accent)] mt-0.5">&#10003;</span>{f}
                                            </li>
                                        ))}
                                        {tier.features.length > 3 && <li className="text-[var(--color-accent)] font-medium">+{tier.features.length - 3} more</li>}
                                    </ul>

                                    <div className={`mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 text-[11px] ${tier.requiresExternal ? 'text-yellow-500' : 'text-green-400'}`}>
                                        {tier.requiresExternal ? <HardDrive size={11} /> : <Cloud size={11} />}
                                        {tier.storage}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Tier detail: storage/retention/limits */}
                        <div className="mt-3 p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <div className="text-[var(--color-text-tertiary)] mb-1">Restoration Limit</div>
                                <div className="font-medium">{selected.scanLimit}</div>
                            </div>
                            <div>
                                <div className="text-[var(--color-text-tertiary)] mb-1">Cloud Storage</div>
                                <div className="font-medium">{selected.storage}</div>
                            </div>
                            <div>
                                <div className="text-[var(--color-text-tertiary)] mb-1">Data Retention</div>
                                <div className="font-medium">{selected.retention}</div>
                            </div>
                        </div>
                    </div>

                    {/* File Summary */}
                    <div className="p-4 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-[var(--color-accent)]" />
                            <div>
                                <div className="text-sm font-medium">Restoration Summary</div>
                                <div className="text-[var(--color-text-tertiary)] text-xs">{totalFiles.toLocaleString()} files detected &middot; {formatBytes(dataSize)}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-light">${selected.price * deviceCount}</div>
                            <div className="text-[var(--color-text-tertiary)] text-xs">{deviceCount > 1 ? `${deviceCount} devices · ` : ''}one-time</div>
                        </div>
                    </div>

                    {/* Payment policy */}
                    <div className="text-xs text-[var(--color-text-dim)] leading-relaxed">
                        All completed purchases are final. You are viewing this checkout because files were detected during your scan. RestoreIt does not guarantee restoration of any specific files.
                    </div>

                    <button
                        onClick={handlePaySecurely}
                        disabled={isRedirecting}
                        className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white px-5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lock size={15} />
                        {isRedirecting ? 'Redirecting...' : `Pay Securely — $${selected.price * deviceCount}.00`}
                    </button>

                    <p className="text-center text-[10px] text-[var(--color-text-dim)] leading-relaxed">
                        You&apos;ll be redirected to our secure payment partner to complete your purchase. By proceeding you agree to our <a href="/terms" className="underline hover:text-[var(--color-text-secondary)]" target="_blank">Terms of Service</a> and <a href="/privacy" className="underline hover:text-[var(--color-text-secondary)]" target="_blank">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
