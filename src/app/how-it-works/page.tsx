import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';
import { ArrowRight, Terminal, Shield, Cloud, Lock, Monitor, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'How It Works — restoreit',
    description: 'Learn how restoreit cloud-based restoration works.',
};

const steps = [
    {
        number: '01',
        title: 'Connect',
        desc: 'Describe your situation — accidental deletion, formatted drive, corrupted files. Select the drive and run a single relay command in your terminal.',
        icon: <Terminal size={24} />,
        detail: 'The relay is a lightweight script that launches entirely in your computer\'s RAM — nothing is installed to disk. It reads raw sectors from your drive and never writes a single byte.',
    },
    {
        number: '02',
        title: 'Scan',
        desc: 'The relay streams your drive\'s sectors to our cloud engine over an encrypted connection. Our algorithms analyze the raw data for restorable files.',
        icon: <Cloud size={24} />,
        detail: 'restoreit Scan uses quick pattern matching. restoreit Pro uses deep sector-level reconstruction that can piece together damaged and fragmented files.',
    },
    {
        number: '03',
        title: 'Preview',
        desc: 'See exactly what was detected — file names, types, sizes, and integrity scores. You decide whether to proceed.',
        icon: <Monitor size={24} />,
        detail: 'Browse results by file type, search for specific files, and check integrity scores that indicate how complete each file is. You are in full control before committing.',
    },
    {
        number: '04',
        title: 'restoreit',
        desc: 'Choose your plan, complete payment, and access your restored files securely via restoreit Cloud.',
        icon: <Lock size={24} />,
        detail: 'restoreit Scan provides 48-hour cloud access. restoreit Pro includes 7-day cloud retention. Add restoreit Cloud for long-term 500GB encrypted storage.',
    },
    {
        number: '05',
        title: 'Protect',
        desc: 'Add restoreit Protection to continuously monitor your drives and prevent future data loss.',
        icon: <ShieldCheck size={24} />,
        detail: 'The $29/mo Protection plan watches your drives for early warning signs — bad sectors, filesystem anomalies, and degradation patterns — so you never lose data again.',
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <section className="max-w-3xl mx-auto px-6 md:px-8 space-y-20">
                    <div className="space-y-6">
                        <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">How It Works</div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter">
                            Five steps. Zero disk writes.
                        </h1>
                        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                            restoreit never installs anything on your drive. A memory-only relay streams your sectors to our cloud engine for analysis. Here&apos;s the full process.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {steps.map((step) => (
                            <div key={step.number} className="group relative">
                                <div className="flex gap-8">
                                    <div className="shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-card-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] group-hover:border-[var(--color-accent)]/30 transition-colors">
                                            {step.icon}
                                        </div>
                                        <div className="text-[var(--color-text-dim)] text-3xl font-black text-center mt-3">{step.number}</div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                                        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{step.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Relay Explainer */}
                    <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-6">
                        <h2 className="text-2xl font-black tracking-tight">The Secure Relay</h2>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                            The restoreit relay is a lightweight script that runs entirely in your computer&apos;s RAM. It reads raw sector data from your drive and streams it over an encrypted TLS connection to our cloud engine. The relay never writes to your disk — it only reads.
                        </p>
                        <div className="font-mono text-xs bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 text-[var(--color-accent)] flex items-center gap-3">
                            <Terminal size={14} />
                            curl -sL https://restoreit.app/relay | bash
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['Zero disk writes', 'Memory-only execution', 'TLS encrypted stream'].map((label) => (
                                <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-accent)]">
                                    <Shield size={14} /><span className="text-[var(--color-text-secondary)]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <h2 className="text-3xl font-black tracking-tight">Ready to scan your drive?</h2>
                        <Link
                            href="/restore"
                            className="inline-flex items-center gap-3 bg-[var(--color-accent)] hover:opacity-90 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)]"
                        >
                            Get Started <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
