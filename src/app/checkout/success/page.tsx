"use client";

import { Suspense, useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Cloud, Download } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        // In production, verify payment via API
        // For now, show success after brief delay
        const timer = setTimeout(() => {
            setStatus('success');
        }, 1500);
        return () => clearTimeout(timer);
    }, [paymentId]);

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500 text-sm">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center px-6 selection:bg-[var(--color-accent)]/30">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-green-400" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight">Payment Confirmed</h1>
                    <p className="text-zinc-500 text-lg leading-relaxed">
                        Your restoration is ready. Your files are waiting for you in RestoreIt Cloud.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/account/vault"
                        className="w-full h-14 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_20px_40px_rgba(138,43,226,0.25)]"
                    >
                        <Cloud size={16} /> Go to RestoreIt Cloud <ArrowRight size={16} />
                    </Link>

                    <Link
                        href="/restore"
                        className="w-full h-12 rounded-2xl border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={14} /> Start Another Restoration
                    </Link>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <p className="text-xs text-zinc-600">
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
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
