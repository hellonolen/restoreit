"use client";

import { Suspense, useEffect, useState, useCallback } from 'react';
import { CheckCircle2, ArrowRight, Cloud, Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'error'>('verifying');
    const [attempts, setAttempts] = useState(0);
    const paymentId = searchParams.get('payment_id');

    const verify = useCallback(async () => {
        try {
            const res = await fetch('/api/checkout/verify');
            const data = (await res.json()) as { success: boolean; verified?: boolean; tier?: string };
            if (data.success && data.verified) {
                setStatus('success');
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;

        async function poll() {
            const verified = await verify();
            if (cancelled) return;

            if (verified) return;

            setAttempts(prev => {
                const next = prev + 1;
                if (next >= 12) {
                    // After ~30 seconds, show pending state (webhook may be delayed)
                    setStatus('pending');
                    return next;
                }
                timer = setTimeout(poll, 2500);
                return next;
            });
        }

        poll();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [paymentId, verify]);

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center transition-colors duration-300">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Verifying your payment...</p>
                    {attempts > 4 && (
                        <p className="text-[var(--color-text-dim)] text-xs">This may take a moment while we confirm with our payment provider.</p>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-6 transition-colors duration-300">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto">
                        <AlertTriangle size={40} className="text-yellow-400" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black tracking-tight">Payment Processing</h1>
                        <p className="text-[var(--color-text-tertiary)] text-lg leading-relaxed">
                            Your payment is being processed. This usually takes less than a minute. Check your account shortly.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link
                            href="/account"
                            className="w-full h-14 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3"
                        >
                            Go to Account <ArrowRight size={16} />
                        </Link>
                    </div>
                    <p className="text-xs text-[var(--color-text-dim)]">
                        If your payment doesn&apos;t appear within 5 minutes, contact <Link href="/support" className="text-[var(--color-accent)] hover:underline">support</Link>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-6 selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-green-400" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight">Payment Confirmed</h1>
                    <p className="text-[var(--color-text-tertiary)] text-lg leading-relaxed">
                        Your restoration is ready. Your files are waiting for you in RestoreIt Cloud.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/account/cloud"
                        className="w-full h-14 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_20px_40px_rgba(138,43,226,0.25)]"
                    >
                        <Cloud size={16} /> Go to RestoreIt Cloud <ArrowRight size={16} />
                    </Link>

                    <Link
                        href="/restore"
                        className="w-full h-12 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-focus)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={14} /> Start Another Restoration
                    </Link>
                </div>

                <div className="pt-6 border-t border-[var(--color-border-subtle)]">
                    <p className="text-xs text-[var(--color-text-dim)]">
                        A confirmation email has been sent to your account email. If you have questions, visit our{' '}
                        <Link href="/support" className="text-[var(--color-accent)] hover:underline">support page</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center transition-colors duration-300">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Loading...</p>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
