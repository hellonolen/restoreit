"use client";
// Account Layout Shell — shared by all /account/* pages
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, History, Shield, Cloud, ArrowLeft } from 'lucide-react';

const navItems = [
    { href: '/account', label: 'Profile', icon: User, exact: true },
    { href: '/account/billing', label: 'Billing', icon: CreditCard },
    { href: '/account/history', label: 'Restore History', icon: History },
    { href: '/account/vault', label: 'restoreit', icon: Cloud },
    { href: '/account/protection', label: 'Protection', icon: Shield },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-8 lg:px-12 py-5 border-b border-white/5 sticky top-0 z-40 bg-[#0A0A0B]">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-[#8A2BE2] flex items-center justify-center shadow-lg shadow-[#8A2BE2]/20">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                        <span className="text-sm font-semibold tracking-wide text-white">restoreit</span>
                    </Link>
                    <span className="text-zinc-700">/</span>
                    <span className="text-sm text-zinc-500">Account</span>
                </div>
                <Link href="/" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft size={14} />Back to Restore
                </Link>
            </header>

            <div className="flex flex-1 max-w-5xl w-full mx-auto">
                {/* Sidebar Nav */}
                <aside className="w-52 shrink-0 border-r border-white/5 py-8 px-4" aria-label="Account navigation">
                    <div className="mb-6 px-3">
                        <div className="w-10 h-10 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#8A2BE2] flex items-center justify-center font-bold text-sm mb-2">
                            JD
                        </div>
                        <div className="text-white text-sm font-medium">Jane Doe</div>
                        <div className="text-zinc-600 text-xs">jane@example.com</div>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map(({ href, label, icon: Icon, exact }) => {
                            const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/account';
                            const exactActive = exact && pathname === href;
                            const isActive = exact ? exactActive : active;
                            return (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[#8A2BE2]/10 text-white border border-[#8A2BE2]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                                    <Icon size={15} className={isActive ? 'text-[#8A2BE2]' : ''} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 py-8 px-8">{children}</main>
            </div>
        </div>
    );
}
