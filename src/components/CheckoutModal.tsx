// AGENT 5 — CheckoutModal: tier limits, refund policy, restore guarantee, storage info
"use client";

import { useRef, useState } from 'react';
import { X, CreditCard, Lock, ShieldCheck, HardDrive, Cloud, Star, Info, Shield } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface CheckoutModalProps {
    onClose: () => void;
    onSuccess: () => void;
    totalFiles: number;
    dataSize: number;
}

function formatBytes(b: number): string {
    if (b === 0) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

export default function CheckoutModal({ onClose, onSuccess, totalFiles, dataSize }: CheckoutModalProps) {
    const [selectedTier, setSelectedTier] = useState<'standard' | 'pro'>('standard');
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);
    const [showRefundPolicy, setShowRefundPolicy] = useState(false);
    const [email, setEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const tiers = [
        {
            id: 'standard' as const,
            name: 'restoreit',
            price: 89,
            scanLimit: 'Single restore',
            storage: 'Your own drive required',
            retention: 'Immediate transfer only',
            requiresExternal: true,
            features: [
                'Full cloud restore',
                'Restored file bundle download',
                'Selective file restore',
                '7-day support window',
            ],
            excluded: ['restoreit storage', 'Direct secure download', 'Priority queue'],
        },
        {
            id: 'pro' as const,
            name: 'restoreit Pro',
            price: 249,
            scanLimit: 'Unlimited re-downloads',
            storage: '500 GB restoreit included',
            retention: '7-day secure vault retention',
            requiresExternal: false,
            features: [
                'Everything in restoreit',
                '500 GB private restoreit',
                'Direct secure download — no external drive needed',
                '7-day encrypted vault retention',
                'Priority restore queue',
                'Extended file history',
                '2FA restoreit access',
            ],
            excluded: [],
        },
    ];

    const selected = tiers.find(t => t.id === selectedTier)!;

    const inputClass = `w-full bg-black/50 border border-white/10 rounded-lg p-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/50 transition-all font-mono text-sm`;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Secure Checkout">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-[#111113] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto"
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[#8A2BE2]" size={20} />
                        <h2 className="text-white font-semibold">Secure Checkout</h2>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">TLS Encrypted</span>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5" aria-label="Close checkout">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 lg:p-8 space-y-6">

                    {/* Tier Selector */}
                    <div>
                        <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-4">Select Your Restore Tier</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tiers.map(tier => (
                                <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                                    className={`p-5 rounded-xl border text-left transition-all ${selectedTier === tier.id
                                        ? 'border-[#8A2BE2] bg-[#8A2BE2]/5 ring-1 ring-[#8A2BE2]'
                                        : 'border-white/10 bg-black/20 hover:border-white/20'
                                        }`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="text-white font-semibold text-sm">{tier.name}</div>
                                            <div className="text-2xl font-light text-white mt-1">${tier.price}<span className="text-zinc-500 text-sm">.00</span></div>
                                        </div>
                                        {tier.id === 'pro' && <Star size={14} className="text-[#8A2BE2] fill-[#8A2BE2]" />}
                                        {selectedTier === tier.id && <div className="w-4 h-4 rounded-full bg-[#8A2BE2] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>}
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-zinc-500">
                                        {tier.features.slice(0, 3).map(f => (
                                            <li key={f} className="flex items-start gap-2">
                                                <span className="text-[#8A2BE2] mt-0.5">✓</span>{f}
                                            </li>
                                        ))}
                                        {tier.features.length > 3 && <li className="text-[#8A2BE2] font-medium">+{tier.features.length - 3} more</li>}
                                    </ul>

                                    <div className={`mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] ${tier.requiresExternal ? 'text-yellow-500' : 'text-green-400'}`}>
                                        {tier.requiresExternal ? <HardDrive size={11} /> : <Cloud size={11} />}
                                        {tier.storage}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Tier detail: storage/retention/limits */}
                        <div className="mt-3 p-4 rounded-xl bg-black/30 border border-white/5 grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <div className="text-zinc-500 mb-1">Scan Limit</div>
                                <div className="text-zinc-300 font-medium">{selected.scanLimit}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500 mb-1">Vault Storage</div>
                                <div className="text-zinc-300 font-medium">{selected.storage}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500 mb-1">Data Retention</div>
                                <div className="text-zinc-300 font-medium">{selected.retention}</div>
                            </div>
                        </div>
                    </div>

                    {/* File Summary */}
                    <div className="p-4 rounded-xl bg-[#8A2BE2]/5 border border-[#8A2BE2]/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-[#8A2BE2]" />
                            <div>
                                <div className="text-white text-sm font-medium">restoreit Protection</div>
                                <div className="text-zinc-500 text-xs">Real-time monitoring for your critical disk arrays.</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-light text-white">${selected.price}</div>
                            <div className="text-zinc-500 text-xs">one-time</div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2" htmlFor="checkout-email">Email Address</label>
                            <input id="checkout-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2" htmlFor="checkout-card">Card Number</label>
                            <div className="relative">
                                <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input id="checkout-card" type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className={`${inputClass} pl-10`} autoComplete="cc-number" />
                            </div>
                            <div className="flex mt-2 gap-2">
                                <input type="text" placeholder="MM / YY" value={expiry} onChange={e => setExpiry(e.target.value)} className={`${inputClass} w-1/2`} autoComplete="cc-exp" aria-label="Expiry date" />
                                <input type="text" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} className={`${inputClass} w-1/2`} autoComplete="cc-csc" aria-label="CVC" />
                            </div>
                        </div>
                    </div>

                    {/* Refund policy */}
                    <div>
                        <button onClick={() => setShowRefundPolicy(p => !p)} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Info size={13} />What is your refund policy?
                        </button>
                        {showRefundPolicy && (
                            <div className="mt-3 p-4 rounded-xl border border-white/8 bg-black/30 text-xs text-zinc-400 leading-relaxed animate-in fade-in duration-200">
                                <strong className="text-zinc-300 block mb-1">Our Guarantee</strong>
                                If the scan detects restorable files and restoreit fails to deliver them to your restoreit, you receive a full refund — no questions asked. If no files are detected, you are not charged. Restore success depends on the extent of overwriting since deletion; we cannot restore files that have been physically overwritten.
                            </div>
                        )}
                    </div>

                    <button onClick={onSuccess}
                        className="w-full bg-white hover:bg-zinc-200 text-black px-5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                        <Lock size={15} />
                        Pay ${selected.price}.00 — {selected.name}
                    </button>

                    <p className="text-center text-[10px] text-zinc-600 leading-relaxed">
                        All payments are processed via encrypted Secure Checkout. Your card data is never stored on restoreit servers. By proceeding you agree to our <a href="/terms" className="underline hover:text-zinc-400" target="_blank">Terms of Service</a> and <a href="/privacy" className="underline hover:text-zinc-400" target="_blank">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
