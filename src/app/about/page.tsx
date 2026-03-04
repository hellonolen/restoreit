import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Shield, Cpu, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About — RestoreIt',
    description: 'Learn about RestoreIt, the cloud-based file restoration platform that never writes to your drive.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <section className="max-w-3xl mx-auto px-6 md:px-8 space-y-16">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                            Restoration software has a fatal flaw.
                        </h1>
                        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                            Every restoration tool on the market requires you to download and install it — onto the same drive that holds your deleted files. That installation writes new data to disk, potentially overwriting the very sectors you need.
                        </p>
                        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                            RestoreIt was built to eliminate that risk entirely.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black tracking-tight">How we&apos;re different</h2>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                            RestoreIt is a cloud-based restoration platform. Instead of installing software on your drive, you run a lightweight relay command that executes entirely in your computer&apos;s memory (RAM). The relay reads your drive&apos;s raw sectors and streams them over an encrypted connection to our cloud engine for analysis. Nothing is ever written to your disk.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Shield size={24} />, title: 'Zero Disk Writes', desc: 'The relay runs in RAM only. Your drive is read, never written to. This is the safest possible approach to restoration.' },
                            { icon: <Cpu size={24} />, title: 'Cloud-Powered Analysis', desc: 'Our cloud engine processes your drive data using deep scan algorithms that reconstruct files from raw binary patterns.' },
                            { icon: <Lock size={24} />, title: 'Encrypted End-to-End', desc: 'All data in transit uses TLS 1.3. All data at rest uses AES-256 encryption. We operate on a zero-access principle.' },
                        ].map((item) => (
                            <div key={item.title} className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold">{item.title}</h3>
                                <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black tracking-tight">Our products</h2>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                            RestoreIt offers four products designed to cover every stage — from immediate crisis restoration to long-term data protection.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'RestoreIt Scan', desc: 'Immediate device scan and restoration. Per device.' },
                                { name: 'RestoreIt Pro', desc: 'Deep scan with damaged file reconstruction and priority restoration.' },
                                { name: 'RestoreIt Cloud', desc: '500GB encrypted cloud storage for restored files.' },
                                { name: 'RestoreIt Protection', desc: 'Disk monitoring, corruption alerts, and automated protection.' },
                            ].map((p) => (
                                <div key={p.name} className="p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] space-y-2">
                                    <div className="text-sm font-bold">{p.name}</div>
                                    <div className="text-xs text-[var(--color-text-tertiary)]">{p.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
