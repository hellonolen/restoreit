"use client";
// Account Layout Shell — shared by all /account/* pages
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, CreditCard, History, Shield, Cloud, ArrowLeft, Lock, LogOut } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

const navItems = [
    { href: '/account', label: 'Profile', icon: User, exact: true },
    { href: '/account/billing', label: 'Billing', icon: CreditCard },
    { href: '/account/history', label: 'Restore History', icon: History },
    { href: '/account/vault', label: 'RestoreIt Cloud', icon: Cloud },
    { href: '/account/protection', label: 'Protection', icon: Shield },
    { href: '/account/security', label: 'Security', icon: Lock },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useUser();

    const initials = user?.firstName
        ? user.firstName.charAt(0).toUpperCase()
        : '?';

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-8 lg:px-12 py-5 border-b border-white/5 sticky top-0 z-40 bg-[#0A0A0B]">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                            <div className="w-2 h-2 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-sm font-bold tracking-wide text-white">RESTOREIT</span>
                    </Link>
                    <span className="text-zinc-700">/</span>
                    <span className="text-sm text-zinc-500">Account</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/restore" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft size={14} />Back to Restore
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </header>

            <div className="flex flex-1 max-w-5xl w-full mx-auto">
                {/* Sidebar Nav */}
                <aside className="w-52 shrink-0 border-r border-white/5 py-8 px-4 hidden lg:block" aria-label="Account navigation">
                    <div className="mb-6 px-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center font-bold text-sm mb-2">
                            {isLoading ? '...' : initials}
                        </div>
                        <div className="text-white text-sm font-medium">
                            {isLoading ? 'Loading...' : (user?.firstName || 'Guest')}
                        </div>
                        <div className="text-zinc-600 text-xs">
                            {isLoading ? '' : (user?.email || '')}
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map(({ href, label, icon: Icon, exact }) => {
                            const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/account';
                            const exactActive = exact && pathname === href;
                            const isActive = exact ? exactActive : active;
                            return (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[var(--color-accent)]/10 text-white border border-[var(--color-accent)]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                                    <Icon size={15} className={isActive ? 'text-[var(--color-accent)]' : ''} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 py-8 px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
