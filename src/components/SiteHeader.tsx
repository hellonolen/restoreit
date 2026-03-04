"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
];

export default function SiteHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-5 flex items-center justify-between border-b border-white/[0.04] bg-black/80 backdrop-blur-xl">
                <Link href="/" className="group flex items-center gap-3 transition-all duration-500 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.3)] group-hover:scale-110 transition-transform">
                        <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45" />
                    </div>
                    <span className="text-lg font-black tracking-[0.3em] text-white">RESTOREIT</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`transition-colors ${pathname === href ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        href="/restore"
                        className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--color-accent)]/20"
                    >
                        Get Started
                    </Link>
                </nav>

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile nav overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-8 lg:hidden">
                    <nav className="flex flex-col gap-4 text-lg font-bold">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`py-3 border-b border-white/5 ${pathname === href ? 'text-white' : 'text-zinc-300 hover:text-white'}`}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            href="/restore"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-4 h-14 rounded-2xl bg-[var(--color-accent)] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            )}
        </>
    );
}
