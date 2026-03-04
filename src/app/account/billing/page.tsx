"use client";
// /account/billing — card management + protection plan subscription
import { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Lock, X } from 'lucide-react';

const mockCard = { brand: 'Visa', last4: '4242', expiry: '09/27' };
const mockInvoices = [
    { id: 'INV-001', date: 'Mar 3, 2026', desc: 'restoreit Pro — One-time Restore', amount: '$249.00', status: 'paid' },
    { id: 'INV-002', date: 'Feb 3, 2026', desc: 'restoreit — One-time Restore', amount: '$89.00', status: 'paid' },
];

export default function BillingPage() {
    const [hasProtection, setHasProtection] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cardNum, setCardNum] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveCard = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setSaving(false);
        setSaved(true);
        setShowCardForm(false);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleEnableProtection = async () => {
        await new Promise(r => setTimeout(r, 800));
        setHasProtection(true);
    };

    const inputClass = 'w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#8A2BE2]/50 focus:ring-1 focus:ring-[#8A2BE2]/40 transition-all font-mono text-sm';

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold text-white mb-1">Billing & Subscription</h1>
                <p className="text-sm text-zinc-500">Manage your payment method and Protection Plan subscription.</p>
            </div>

            {saved && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-in fade-in duration-300">
                    <CheckCircle2 size={16} />Card updated successfully.
                </div>
            )}

            {/* Payment Method */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={16} className="text-[#8A2BE2]" />Payment Method
                    </h2>
                    {!showCardForm && (
                        <button onClick={() => setShowCardForm(true)}
                            className="text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                            Update Card
                        </button>
                    )}
                </div>

                {!showCardForm ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="w-12 h-8 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-400">VISA</span>
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">•••• •••• •••• {mockCard.last4}</div>
                            <div className="text-zinc-500 text-xs">Expires {mockCard.expiry}</div>
                        </div>
                        <CheckCircle2 size={15} className="text-green-400 ml-auto" />
                    </div>
                ) : (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-300 font-medium">Update Payment Method</span>
                            <button onClick={() => setShowCardForm(false)} className="text-zinc-600 hover:text-white p-1"><X size={15} /></button>
                        </div>
                        <div className="relative">
                            <CreditCard size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={cardNum} onChange={e => setCardNum(e.target.value)} className={`${inputClass} pl-10`} autoComplete="cc-number" aria-label="Card number" />
                        </div>
                        <div className="flex gap-3">
                            <input type="text" placeholder="MM / YY" value={expiry} onChange={e => setExpiry(e.target.value)} className={`${inputClass} flex-1`} autoComplete="cc-exp" aria-label="Expiry" />
                            <input type="text" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} className={`${inputClass} flex-1`} autoComplete="cc-csc" aria-label="CVC" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <Lock size={11} />Card data is never stored on restoreit servers.
                        </div>
                        <button onClick={handleSaveCard} disabled={saving}
                            className="w-full bg-[#8A2BE2] hover:bg-[#7e22ce] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                            {saving ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</> : 'Save Card'}
                        </button>
                    </div>
                )}
            </section>

            {/* Protection Plan */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#8A2BE2]" />Protection Plan
                    </h2>
                    {hasProtection && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold uppercase tracking-wider">Active</span>
                    )}
                </div>

                {!hasProtection ? (
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Continuous disk health monitoring, early warning alerts, extended restoreit retention, and priority restore queue — all for $12/month on the card on file.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                            {['24/7 disk health monitoring', 'Corruption detection alerts', 'Priority restore queue', 'Extended 30-day vault retention', 'Full restore history archive', 'Cancel anytime'].map(f => (
                                <li key={f} className="flex items-center gap-2"><span className="text-[#8A2BE2]">✓</span>{f}</li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#8A2BE2]/5 border border-[#8A2BE2]/20">
                            <div>
                                <div className="text-white font-semibold">$12 / month</div>
                                <div className="text-zinc-500 text-xs">Billed monthly · Cancel anytime</div>
                            </div>
                            <button onClick={handleEnableProtection}
                                className="bg-[#8A2BE2] hover:bg-[#7e22ce] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_16px_rgba(138,43,226,0.25)]">
                                Enable Protection
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                            <div>
                                <div className="text-white font-medium text-sm">Protection Plan Active</div>
                                <div className="text-zinc-500 text-xs">$12.00/month · Next billing: April 3, 2026 · Visa ••{mockCard.last4}</div>
                            </div>
                        </div>
                        {!showCancelConfirm ? (
                            <button onClick={() => setShowCancelConfirm(true)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                                Cancel Protection Plan
                            </button>
                        ) : (
                            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-zinc-400">Cancelling will stop disk monitoring and reduce restoreit retention to 7 days starting your next billing cycle.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm transition-all">Keep Plan</button>
                                    <button onClick={() => { setHasProtection(false); setShowCancelConfirm(false); }} className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm transition-all">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Invoice History */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Invoice History</h2>
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                    {mockInvoices.map((inv, i) => (
                        <div key={inv.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                            <div>
                                <div className="text-zinc-300 text-sm font-medium">{inv.desc}</div>
                                <div className="text-zinc-600 text-xs mt-0.5">{inv.date} · {inv.id}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-zinc-300 font-mono text-sm">{inv.amount}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase">{inv.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
