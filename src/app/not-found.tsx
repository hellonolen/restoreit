import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-6 selection:bg-[var(--color-accent)]/30">
            <div className="max-w-md text-center space-y-8">
                <div className="space-y-4">
                    <div className="text-[var(--color-accent)] text-8xl font-black tracking-tighter">404</div>
                    <h1 className="text-3xl font-black tracking-tight">Page not found</h1>
                    <p className="text-[var(--color-text-tertiary)] leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.15em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)]"
                    >
                        <Home size={16} /> Go Home
                    </Link>
                    <Link
                        href="/support"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] text-sm font-bold transition-all"
                    >
                        <Search size={16} /> Get Help
                    </Link>
                </div>

                <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)] transition-colors">
                    <ArrowLeft size={12} /> Back to restoreit
                </Link>
            </div>
        </div>
    );
}
