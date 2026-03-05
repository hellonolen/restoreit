"use client";
// /account/billing — payment history + protection plan subscription (real D1 data)
import { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface Payment {
    id: string;
    tier: string;
    amount: number;
    status: string;
    createdAt: string;
}

interface Subscription {
    id: string;
    status: string;
    startedAt: string;
    cancelledAt: string | null;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function tierLabel(tier: string): string {
    if (tier === 'pro') return 'restoreit Pro — Restoration';
    if (tier === 'standard') return 'restoreit — Restoration';
    return `restoreit — ${tier}`;
}

export default function BillingPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        fetch('/api/billing')
            .then(res => res.json() as Promise<{ payments?: Payment[]; subscription?: Subscription | null }>)
            .then(data => {
                if (data.payments) setPayments(data.payments);
                if (data.subscription) setSubscription(data.subscription);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const hasProtection = subscription?.status === 'active';

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

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 size={32} className="text-[var(--color-text-dim)] mx-auto mb-3 animate-spin" />
                <p className="text-[var(--color-text-tertiary)] text-sm">Loading billing...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold mb-1">Billing & Subscription</h1>
                <p className="text-sm text-[var(--color-text-tertiary)]">Manage your subscription and view payment history.</p>
            </div>

            {/* Payment Method — Managed by Whop */}
            <section className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={16} className="text-[var(--color-accent)]" />Payment Method
                    </h2>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
            <section className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[var(--color-accent)]" />Protection Plan
                    </h2>
                    {hasProtection && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold uppercase tracking-wider">Active</span>
                    )}
                </div>

                {!hasProtection ? (
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            Continuous disk health monitoring, early warning alerts, extended restoreit Cloud retention, and priority restore queue.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-tertiary)]">
                            {['24/7 disk health monitoring', 'Corruption detection alerts', 'Priority restore queue', 'Extended 30-day cloud retention', 'Full restore history archive', 'Cancel anytime'].map(f => (
                                <li key={f} className="flex items-center gap-2"><span className="text-[var(--color-accent)]">&#10003;</span>{f}</li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                            <div>
                                <div className="font-semibold">$29/month</div>
                                <div className="text-[var(--color-text-tertiary)] text-xs">Billed monthly &middot; Cancel anytime</div>
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
                                <div className="font-medium text-sm">Protection Plan Active</div>
                                <div className="text-[var(--color-text-tertiary)] text-xs">$29/month &middot; Managed via Whop</div>
                            </div>
                        </div>
                        {!showCancelConfirm ? (
                            <button onClick={() => setShowCancelConfirm(true)} className="text-xs text-[var(--color-text-dim)] hover:text-red-400 transition-colors">
                                Cancel Protection Plan
                            </button>
                        ) : (
                            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-[var(--color-text-secondary)]">Cancelling will stop disk monitoring and reduce restoreit Cloud retention to 7 days starting your next billing cycle.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] text-sm transition-all">Keep Plan</button>
                                    <button onClick={() => { setSubscription(null); setShowCancelConfirm(false); }} className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm transition-all">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Invoice History */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider">Payment History</h2>
                {payments.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-[var(--color-border-subtle)] text-center text-[var(--color-text-dim)] text-sm">
                        No payments yet.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                        {payments.map((p, i) => (
                            <div key={p.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                                <div>
                                    <div className="text-sm font-medium">{tierLabel(p.tier)}</div>
                                    <div className="text-[var(--color-text-dim)] text-xs mt-0.5">{formatDate(p.createdAt)} &middot; {p.id.slice(0, 12)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm">{formatAmount(p.amount)}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                        p.status === 'completed'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : p.status === 'failed'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                    }`}>{p.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
