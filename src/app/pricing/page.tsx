"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Shield, HardDrive, Cloud, ArrowRight, Lock, Activity, Monitor } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

interface PlanFeature {
    text: string;
    included: boolean;
    highlight?: boolean;
}

interface Plan {
    id: string;
    name: string;
    fullName: string;
    price: number;
    period: string;
    description: string;
    icon: React.ReactNode;
    cta: string;
    ctaHref: string;
    ctaStyle: string;
    recommended?: boolean;
    availability?: string;
    perDevice?: boolean;
    features: PlanFeature[];
}

const plans: Plan[] = [
    {
        id: 'scan',
        name: 'Scan',
        fullName: 'restoreit Scan',
        price: 89,
        period: 'one-time per device',
        description: 'Immediate device scan and file detection. Access recovered files via restoreit Cloud.',
        icon: <HardDrive size={24} />,
        cta: 'Get Started',
        ctaHref: '/restore',
        ctaStyle: 'border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] text-[var(--color-foreground)]',
        perDevice: true,
        features: [
            { text: 'Cloud restoration scan', included: true },
            { text: 'Quick scan mode', included: true },
            { text: 'Selective file restoration', included: true },
            { text: 'Secure cloud delivery', included: true },
            { text: '7-day support window', included: true },
            { text: 'Deep scan & file reconstruction', included: false },
            { text: 'Priority restore queue', included: false },
            { text: 'restoreit Cloud storage', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        fullName: 'restoreit Pro',
        price: 249,
        period: 'one-time per device',
        description: 'Deep scan with damaged file reconstruction, priority restoration, and 7-day cloud retention.',
        icon: <Shield size={24} />,
        cta: 'Get Started',
        ctaHref: '/restore',
        ctaStyle: 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]',
        recommended: true,
        perDevice: true,
        features: [
            { text: 'Cloud restoration scan', included: true },
            { text: 'Deep scan & quick scan modes', included: true },
            { text: 'Damaged file reconstruction', included: true, highlight: true },
            { text: 'Selective file restoration', included: true },
            { text: 'Priority restore queue', included: true, highlight: true },
            { text: '7-day cloud retention', included: true, highlight: true },
            { text: 'Unlimited cloud access (7 days)', included: true, highlight: true },
            { text: 'Eligible for restoreit Cloud', included: true, highlight: true },
        ],
    },
    {
        id: 'cloud',
        name: 'restoreit Cloud',
        fullName: 'restoreit Cloud',
        price: 79,
        period: '/year per device',
        description: '500GB encrypted cloud storage for your restored files. Long-term retention and secure access.',
        icon: <Cloud size={24} />,
        cta: 'Add Cloud Storage',
        ctaHref: '/account/billing',
        ctaStyle: 'border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-white',
        availability: 'Pro customers',
        perDevice: true,
        features: [
            { text: '500GB encrypted storage', included: true, highlight: true },
            { text: 'Long-term file retention', included: true, highlight: true },
            { text: 'Secure access anytime', included: true },
            { text: 'AES-256 encryption at rest', included: true },
            { text: 'Unlimited cloud access', included: true },
            { text: 'Multiple device storage', included: true },
            { text: 'Cancel anytime', included: true },
        ],
    },
    {
        id: 'protection',
        name: 'Protection',
        fullName: 'restoreit Protection',
        price: 29,
        period: '/month per device',
        description: 'Post-restoration protection. Continuous monitoring, corruption alerts, restoreit Cloud storage, and priority recovery.',
        icon: <Shield size={24} />,
        cta: 'Add Protection',
        ctaHref: '/account/billing',
        ctaStyle: 'border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] text-[var(--color-foreground)]',
        availability: 'After restoration',
        perDevice: true,
        features: [
            { text: '24/7 disk health monitoring', included: true, highlight: true },
            { text: 'Corruption detection alerts', included: true, highlight: true },
            { text: 'Early warning notifications', included: true },
            { text: 'Priority restore queue', included: true },
            { text: 'Full restore history archive', included: true },
            { text: 'Automated backup protection', included: true },
            { text: 'Cancel anytime', included: true },
        ],
    },
];

const faqs = [
    {
        q: 'Are these prices per device?',
        a: 'Yes. restoreit Scan and restoreit Pro are priced per device — one physical drive per purchase. You can add additional devices at any time.',
    },
    {
        q: 'What\'s the difference between Scan and Pro?',
        a: 'Scan provides a standard cloud restoration scan with 48-hour cloud access. Pro adds deep sector-level scanning, damaged file reconstruction, a priority restore queue, and 7-day cloud retention.',
    },
    {
        q: 'Who can purchase restoreit Cloud?',
        a: 'restoreit Cloud is available exclusively to Pro customers. It provides 500GB of encrypted storage to keep your restored files accessible long-term.',
    },
    {
        q: 'Can I add products later?',
        a: 'Yes. You can upgrade from Scan to Pro, add Cloud storage, or subscribe to Protection at any time after your restoration. Products can be added on whenever you need them.',
    },
    {
        q: 'What if no files are detected?',
        a: 'If the scan detects zero files, no charge is applied. You only pay when the scan finds something.',
    },
    {
        q: 'What is the refund policy?',
        a: 'All completed purchases are final. You review your scan results before purchasing, so you see exactly what was detected before you commit.',
    },
];

const DEVICE_OPTIONS = [1, 2, 3, 4, 5] as const;

export default function PricingPage() {
    const [deviceCount, setDeviceCount] = useState<Record<string, number>>({
        scan: 1,
        pro: 1,
        cloud: 1,
        protection: 1,
    });

    const updateDevices = (planId: string, count: number) => {
        setDeviceCount(prev => ({ ...prev, [planId]: count }));
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28">
                {/* Hero */}
                <section className="pt-8 sm:pt-12 pb-8 px-5 sm:px-6 md:px-8 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
                            Simple, honest pricing.
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--color-text-tertiary)] max-w-xl mx-auto leading-relaxed">
                            Four products. Per-device pricing. Add on anything, anytime.
                        </p>
                    </div>
                </section>

                {/* Plans */}
                <section className="py-16 px-6 md:px-8">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl border p-8 flex flex-col ${plan.recommended
                                    ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] ring-1 ring-[var(--color-accent)]/20'
                                    : 'border-[var(--color-border)] bg-[var(--color-card)]'
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-accent)]/30">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6 space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.recommended
                                        ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                                        : 'bg-[var(--color-card-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                        }`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">{plan.fullName}</h3>
                                        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{plan.description}</p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black">
                                            {plan.perDevice ? plan.price * (deviceCount[plan.id] ?? 1) : plan.price}
                                        </span>
                                        <span className="text-[var(--color-text-tertiary)] text-lg">{plan.period}</span>
                                    </div>
                                    {plan.perDevice && (deviceCount[plan.id] ?? 1) > 1 && (
                                        <div className="text-xs text-[var(--color-text-tertiary)]">
                                            ${plan.price} x {deviceCount[plan.id]} devices
                                        </div>
                                    )}
                                    {plan.perDevice && (
                                        <div className="mt-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-dim)] block mb-1.5">Devices</label>
                                            <select
                                                value={deviceCount[plan.id] ?? 1}
                                                onChange={(e) => updateDevices(plan.id, Number(e.target.value))}
                                                className="w-full bg-[var(--color-card-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-foreground)] appearance-none cursor-pointer hover:border-[var(--color-border-focus)] transition-colors focus:outline-none focus:border-[var(--color-accent)]/50"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                                            >
                                                {DEVICE_OPTIONS.map(n => (
                                                    <option key={n} value={n}>
                                                        {n} device{n > 1 ? 's' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {plan.availability && (
                                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)] bg-[var(--color-card-hover)] px-3 py-1.5 rounded-lg inline-block">
                                            Available to: {plan.availability}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f.text} className={`flex items-start gap-3 text-sm ${f.included
                                            ? f.highlight ? 'text-[var(--color-foreground)] font-medium' : 'text-[var(--color-text-secondary)]'
                                            : 'text-[var(--color-disabled-text)]'
                                            }`}>
                                            {f.included ? (
                                                <Check size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                                            ) : (
                                                <X size={16} className="text-[var(--color-disabled-text)] shrink-0 mt-0.5" />
                                            )}
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.ctaHref}
                                    className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${plan.ctaStyle}`}
                                >
                                    {plan.cta} <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* All sales final banner */}
                    <div className="max-w-7xl mx-auto mt-12">
                        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-card-hover)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                                <Lock size={28} className="text-[var(--color-text-secondary)]" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-black mb-1">Pay After You See Results</h3>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    You review scan results before purchasing — so you know exactly what was detected before you commit. If no files are detected, no charge is applied. All completed purchases are final.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Table */}
                <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-black tracking-tight text-center mb-12">Compare Products</h2>
                        <div className="rounded-2xl border border-[var(--color-border)] overflow-x-auto">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-5 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                                    <div className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Feature</div>
                                    <div className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider text-center">Scan</div>
                                    <div className="p-4 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider text-center">Pro</div>
                                    <div className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider text-center">Cloud</div>
                                    <div className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider text-center">Protection</div>
                                </div>
                                {[
                                    { feature: 'Price', scan: `$${89 * (deviceCount.scan ?? 1)}`, pro: `$${249 * (deviceCount.pro ?? 1)}`, cloud: `$${79 * (deviceCount.cloud ?? 1)}/yr`, protection: `$${29 * (deviceCount.protection ?? 1)}/mo` },
                                    { feature: 'Type', scan: 'One-time', pro: 'One-time', cloud: 'Yearly', protection: 'Monthly' },
                                    { feature: 'Cloud restoration scan', scan: true, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Deep scan mode', scan: false, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Damaged file reconstruction', scan: false, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Priority restore queue', scan: false, pro: true, cloud: '—', protection: true },
                                    { feature: 'Cloud retention', scan: '48 hours', pro: '7 days', cloud: 'Unlimited', protection: '—' },
                                    { feature: 'Cloud access', scan: 'Limited', pro: 'Unlimited', cloud: 'Unlimited', protection: '—' },
                                    { feature: '500GB cloud storage', scan: false, pro: false, cloud: true, protection: false },
                                    { feature: 'Disk health monitoring', scan: false, pro: false, cloud: false, protection: true },
                                    { feature: 'Corruption alerts', scan: false, pro: false, cloud: false, protection: true },
                                    { feature: 'Automated protection', scan: false, pro: false, cloud: false, protection: true },
                                ].map((row, i) => (
                                    <div key={row.feature} className={`grid grid-cols-5 ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                                        <div className="p-4 text-sm text-[var(--color-text-secondary)]">{row.feature}</div>
                                        {[row.scan, row.pro, row.cloud, row.protection].map((val, j) => (
                                            <div key={j} className="p-4 text-center text-sm">
                                                {val === true ? (
                                                    <Check size={16} className="text-green-400 mx-auto" />
                                                ) : val === false ? (
                                                    <X size={16} className="text-[var(--color-disabled-text)] mx-auto" />
                                                ) : (
                                                    <span className="text-[var(--color-text-secondary)]">{val}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works mini */}
                <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-3xl font-black tracking-tight">How it works</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { icon: <HardDrive size={20} />, step: '01', title: 'Run the Scan', desc: 'The relay scans your drive safely — nothing installed, nothing overwritten.' },
                                { icon: <Monitor size={20} />, step: '02', title: 'Review Results', desc: 'See what the scan detected. Check file types, sizes, and integrity.' },
                                { icon: <Cloud size={20} />, step: '03', title: 'Choose & Pay', desc: 'Pick your plan — Scan or Pro. Access your files via restoreit Cloud.' },
                                { icon: <Activity size={20} />, step: '04', title: 'Stay Protected', desc: 'Add Protection for ongoing disk monitoring and corruption alerts.' },
                            ].map((s) => (
                                <div key={s.step} className="space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-card-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] mx-auto">
                                        {s.icon}
                                    </div>
                                    <div className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-[0.3em]">Step {s.step}</div>
                                    <h3 className="text-lg font-bold">{s.title}</h3>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black tracking-tight text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <details key={faq.q} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="text-sm font-bold pr-4">{faq.q}</span>
                                        <ArrowRight size={16} className="text-[var(--color-text-tertiary)] shrink-0 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-24 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Ready to scan your drive?</h2>
                        <p className="text-[var(--color-text-tertiary)] text-lg">No installation. No disk writes. See results before you pay.</p>
                        <Link
                            href="/restore"
                            className="inline-flex items-center gap-3 bg-[var(--color-accent)] hover:opacity-90 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)] active:scale-[0.98]"
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
