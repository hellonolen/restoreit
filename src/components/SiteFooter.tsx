import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="px-6 md:px-8 py-16 md:py-20 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm rotate-45" />
                        </div>
                        <span className="text-base font-black tracking-[0.3em] text-[var(--color-foreground)] uppercase">RestoreIt</span>
                    </Link>
                    <p className="text-[var(--color-text-dim)] max-w-sm text-sm leading-relaxed font-medium">
                        Cloud-based file restoration that never writes to your drive. Scan, restore, and protect your data.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Product</div>
                    <nav className="flex flex-col gap-4 text-xs font-bold text-[var(--color-text-dim)]">
                        <Link href="/pricing" className="hover:text-[var(--color-foreground)] transition-colors">Pricing</Link>
                        <Link href="/how-it-works" className="hover:text-[var(--color-foreground)] transition-colors">How It Works</Link>
                        <Link href="/faq" className="hover:text-[var(--color-foreground)] transition-colors">FAQ</Link>
                        <Link href="/support" className="hover:text-[var(--color-foreground)] transition-colors">Support</Link>
                        <Link href="/partners" className="hover:text-[var(--color-foreground)] transition-colors">Partners</Link>
                        <Link href="/docs/raas" className="hover:text-[var(--color-foreground)] transition-colors">API Docs</Link>
                    </nav>
                </div>

                <div className="space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Legal</div>
                    <nav className="flex flex-col gap-4 text-xs font-bold text-[var(--color-text-dim)]">
                        <Link href="/privacy" className="hover:text-[var(--color-foreground)] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[var(--color-foreground)] transition-colors">Terms of Service</Link>
                        <Link href="/disclaimers" className="hover:text-[var(--color-foreground)] transition-colors">Disclaimers</Link>
                        <Link href="/contact" className="hover:text-[var(--color-foreground)] transition-colors">Contact</Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-[var(--color-border-subtle)]">
                <div className="text-[9px] font-black text-[var(--color-text-dim)] uppercase tracking-[0.2em]">
                    &copy; 2026 RestoreIt. All rights reserved.
                </div>

                <div className="flex items-center gap-4">
                    <nav className="flex items-center gap-6 text-[9px] font-black text-[var(--color-text-dim)] uppercase tracking-widest">
                        <Link href="/privacy" className="hover:text-[var(--color-foreground)] transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-[var(--color-foreground)] transition-colors">Terms</Link>
                        <Link href="/disclaimers" className="hover:text-[var(--color-foreground)] transition-colors">Disclaimers</Link>
                        <Link href="/contact" className="hover:text-[var(--color-foreground)] transition-colors">Contact</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
