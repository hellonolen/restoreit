import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="px-6 md:px-8 py-16 md:py-20 border-t border-white/[0.04] bg-black">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm rotate-45" />
                        </div>
                        <span className="text-base font-black tracking-[0.3em] text-white uppercase">RestoreIt</span>
                    </Link>
                    <p className="text-zinc-600 max-w-sm text-sm leading-relaxed font-medium">
                        Cloud-based file restoration that never writes to your drive. Scan, restore, and protect your data.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Product</div>
                    <nav className="flex flex-col gap-4 text-xs font-bold text-zinc-600">
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                        <Link href="/support" className="hover:text-white transition-colors">Support</Link>
                    </nav>
                </div>

                <div className="space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Legal</div>
                    <nav className="flex flex-col gap-4 text-xs font-bold text-zinc-600">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/disclaimers" className="hover:text-white transition-colors">Disclaimers</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/[0.04]">
                <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em]">
                    &copy; 2026 RestoreIt. All rights reserved.
                </div>

                <div className="flex items-center gap-4">
                    <nav className="flex items-center gap-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/disclaimers" className="hover:text-white transition-colors">Disclaimers</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
