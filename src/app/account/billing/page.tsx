"use client";
// /account/billing — payment history + protection plan subscription (Whop)
import { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { DEMO_INVOICES } from '@/lib/demo-data';

export default function BillingPage() {
    const { isDemo } = useUser();
    const [hasProtection, setHasProtection] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const invoices = isDemo ? DEMO_INVOICES : [];

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: 'protection' }),
            });
            const data = (await res.json()) as { url?: string };
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setSubscribing(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold text-white mb-1">Billing & Subscription</h1>
                <p className="text-sm text-zinc-500">Manage your subscription and view payment history.</p>
            </div>

            {/* Payment Method — Managed by Whop */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={16} className="text-[var(--color-accent)]" />Payment Method
                    </h2>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    Payments are securely processed through Whop. Your card details are never stored on our servers.
                </p>
                <a
                    href="https://whop.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[var(--color-accent)] hover:underline font-bold"
                >
                    Manage Payment on Whop <ExternalLink size={12} />
                </a>
            </section>

            {/* Protection Plan */}
            <section className="p-6 rounded-2xl border border-white/10 bg-black/30 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[var(--color-accent)]" />Protection Plan
                    </h2>
                    {hasProtection && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold uppercase tracking-wider">Active</span>
                    )}
                </div>

                {!hasProtection ? (
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Continuous disk health monitoring, early warning alerts, extended RestoreIt Cloud retention, and priority restore queue — $12/month.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                            {['24/7 disk health monitoring', 'Corruption detection alerts', 'Priority restore queue', 'Extended 30-day cloud retention', 'Full restore history archive', 'Cancel anytime'].map(f => (
                                <li key={f} className="flex items-center gap-2"><span className="text-[var(--color-accent)]">&#10003;</span>{f}</li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                            <div>
                                <div className="text-white font-semibold">$12 / month</div>
                                <div className="text-zinc-500 text-xs">Billed monthly &middot; Cancel anytime</div>
                            </div>
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            >
                                {subscribing ? 'Redirecting...' : 'Subscribe via Whop'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                            <div>
                                <div className="text-white font-medium text-sm">Protection Plan Active</div>
                                <div className="text-zinc-500 text-xs">$12.00/month &middot; Managed via Whop</div>
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
                                    <p className="text-sm text-zinc-400">Cancelling will stop disk monitoring and reduce RestoreIt Cloud retention to 7 days starting your next billing cycle.</p>
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Payment History</h2>
                {invoices.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-white/5 text-center text-zinc-600 text-sm">
                        No payments yet.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        {invoices.map((inv, i) => (
                            <div key={inv.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                                <div>
                                    <div className="text-zinc-300 text-sm font-medium">{inv.description}</div>
                                    <div className="text-zinc-600 text-xs mt-0.5">{inv.date} &middot; {inv.id}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-300 font-mono text-sm">{inv.amount}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase">{inv.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
