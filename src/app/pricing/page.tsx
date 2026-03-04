"use client";

import Link from 'next/link';
import { Check, X, Shield, HardDrive, Cloud, ArrowRight, Download, Lock, Activity, Monitor } from 'lucide-react';
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
    features: PlanFeature[];
}

const plans: Plan[] = [
    {
        id: 'scan',
        name: 'Scan',
        fullName: 'RestoreIt Scan',
        price: 89,
        period: 'per device',
        description: 'Immediate device scan to detect restorable files. Download your files right away.',
        icon: <HardDrive size={24} />,
        cta: 'Get Started',
        ctaHref: '/restore',
        ctaStyle: 'border border-white/10 hover:bg-white/5 text-white',
        features: [
            { text: 'Cloud restoration scan', included: true },
            { text: 'Quick scan mode', included: true },
            { text: 'Selective file restoration', included: true },
            { text: 'Immediate download', included: true },
            { text: '7-day support window', included: true },
            { text: 'Deep scan & file reconstruction', included: false },
            { text: 'Priority restore queue', included: false },
            { text: 'RestoreIt Cloud storage', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        fullName: 'RestoreIt Pro',
        price: 249,
        period: 'per device',
        description: 'Deep scan with damaged file reconstruction, priority restoration, and a 7-day download window.',
        icon: <Download size={24} />,
        cta: 'Get Started',
        ctaHref: '/restore',
        ctaStyle: 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]',
        recommended: true,
        features: [
            { text: 'Cloud restoration scan', included: true },
            { text: 'Deep scan & quick scan modes', included: true },
            { text: 'Damaged file reconstruction', included: true, highlight: true },
            { text: 'Selective file restoration', included: true },
            { text: 'Priority restore queue', included: true, highlight: true },
            { text: '7-day download window', included: true, highlight: true },
            { text: 'Unlimited re-downloads (7 days)', included: true, highlight: true },
            { text: 'Eligible for RestoreIt Cloud', included: true, highlight: true },
        ],
    },
    {
        id: 'cloud',
        name: 'Cloud',
        fullName: 'RestoreIt Cloud',
        price: 79,
        period: '/year',
        description: '500GB encrypted cloud storage for your restored files. Long-term retention and secure access.',
        icon: <Cloud size={24} />,
        cta: 'Add Cloud Storage',
        ctaHref: '/account/billing',
        ctaStyle: 'border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-white',
        availability: 'Pro customers',
        features: [
            { text: '500GB encrypted storage', included: true, highlight: true },
            { text: 'Long-term file retention', included: true, highlight: true },
            { text: 'Secure access anytime', included: true },
            { text: 'AES-256 encryption at rest', included: true },
            { text: 'Unlimited re-downloads', included: true },
            { text: 'Multiple device storage', included: true },
            { text: 'Cancel anytime', included: true },
        ],
    },
    {
        id: 'protection',
        name: 'Protection',
        fullName: 'RestoreIt Protection',
        price: 12,
        period: '/month',
        description: 'Post-restoration protection. Disk monitoring, corruption alerts, and automated backup protection.',
        icon: <Shield size={24} />,
        cta: 'Add Protection',
        ctaHref: '/account/billing',
        ctaStyle: 'border border-white/10 hover:bg-white/5 text-white',
        availability: 'After restoration',
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
        a: 'Yes. RestoreIt Scan and RestoreIt Pro are priced per device — one physical drive per purchase. You can add additional devices at any time.',
    },
    {
        q: 'What\'s the difference between Scan and Pro?',
        a: 'Scan provides a standard cloud restoration scan with immediate download. Pro adds deep sector-level scanning, damaged file reconstruction, a priority restore queue, and a 7-day download window instead of immediate-only.',
    },
    {
        q: 'Who can purchase RestoreIt Cloud?',
        a: 'RestoreIt Cloud is available exclusively to Pro customers. It provides 500GB of encrypted storage to keep your restored files accessible long-term.',
    },
    {
        q: 'Can I add products later?',
        a: 'Yes. You can upgrade from Scan to Pro, add Cloud storage, or subscribe to Protection at any time after your restoration. Products can be added on whenever you need them.',
    },
    {
        q: 'What if no files are detected?',
        a: 'If the scan detects zero restorable files, no charge is applied. You only pay when the scan finds something.',
    },
    {
        q: 'What is the refund policy?',
        a: 'All completed purchases are final. You review your scan results before purchasing, so you see exactly what was detected before you commit.',
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col selection:bg-[var(--color-accent)]/30">
            <SiteHeader />

            <main className="flex-1 pt-28">
                {/* Hero */}
                <section className="pt-12 pb-8 px-6 md:px-8 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
                            Simple, honest pricing.
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto leading-relaxed">
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
                                className={`relative rounded-3xl border p-8 flex flex-col ${
                                    plan.recommended
                                        ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] ring-1 ring-[var(--color-accent)]/20'
                                        : 'border-white/10 bg-white/[0.02]'
                                }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-accent)]/30">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6 space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        plan.recommended
                                            ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                                            : 'bg-white/5 border border-white/10 text-zinc-400'
                                    }`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">{plan.fullName}</h3>
                                        <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black">${plan.price}</span>
                                        <span className="text-zinc-500 text-lg">{plan.period}</span>
                                    </div>
                                    {plan.availability && (
                                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 bg-white/5 px-3 py-1.5 rounded-lg inline-block">
                                            Available to: {plan.availability}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f.text} className={`flex items-start gap-3 text-sm ${
                                            f.included
                                                ? f.highlight ? 'text-white font-medium' : 'text-zinc-400'
                                                : 'text-zinc-700'
                                        }`}>
                                            {f.included ? (
                                                <Check size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                                            ) : (
                                                <X size={16} className="text-zinc-700 shrink-0 mt-0.5" />
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
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Lock size={28} className="text-zinc-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-black text-white mb-1">Pay After You See Results</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    You review scan results before purchasing — so you know exactly what was detected before you commit. If no files are detected, no charge is applied. All completed purchases are final.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Table */}
                <section className="py-16 px-6 md:px-8 border-t border-white/[0.04]">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-black tracking-tight text-center mb-12">Compare Products</h2>
                        <div className="rounded-2xl border border-white/10 overflow-x-auto">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-5 border-b border-white/10 bg-white/[0.02]">
                                    <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Feature</div>
                                    <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Scan</div>
                                    <div className="p-4 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider text-center">Pro</div>
                                    <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Cloud</div>
                                    <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Protection</div>
                                </div>
                                {[
                                    { feature: 'Price', scan: '$89', pro: '$249', cloud: '$79/yr', protection: '$12/mo' },
                                    { feature: 'Type', scan: 'One-time', pro: 'One-time', cloud: 'Yearly', protection: 'Monthly' },
                                    { feature: 'Cloud restoration scan', scan: true, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Deep scan mode', scan: false, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Damaged file reconstruction', scan: false, pro: true, cloud: '—', protection: '—' },
                                    { feature: 'Priority restore queue', scan: false, pro: true, cloud: '—', protection: true },
                                    { feature: 'Download window', scan: 'Immediate', pro: '7 days', cloud: '—', protection: '—' },
                                    { feature: 'Re-downloads', scan: 'Once', pro: 'Unlimited', cloud: 'Unlimited', protection: '—' },
                                    { feature: '500GB cloud storage', scan: false, pro: false, cloud: true, protection: false },
                                    { feature: 'Disk health monitoring', scan: false, pro: false, cloud: false, protection: true },
                                    { feature: 'Corruption alerts', scan: false, pro: false, cloud: false, protection: true },
                                    { feature: 'Automated protection', scan: false, pro: false, cloud: false, protection: true },
                                ].map((row, i) => (
                                    <div key={row.feature} className={`grid grid-cols-5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                                        <div className="p-4 text-sm text-zinc-300">{row.feature}</div>
                                        {[row.scan, row.pro, row.cloud, row.protection].map((val, j) => (
                                            <div key={j} className="p-4 text-center text-sm">
                                                {val === true ? (
                                                    <Check size={16} className="text-green-400 mx-auto" />
                                                ) : val === false ? (
                                                    <X size={16} className="text-zinc-700 mx-auto" />
                                                ) : (
                                                    <span className="text-zinc-400">{val}</span>
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
                <section className="py-16 px-6 md:px-8 border-t border-white/[0.04]">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-3xl font-black tracking-tight">How it works</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { icon: <HardDrive size={20} />, step: '01', title: 'Run the Scan', desc: 'The relay scans your drive safely — nothing installed, nothing overwritten.' },
                                { icon: <Monitor size={20} />, step: '02', title: 'Review Results', desc: 'See what the scan detected. Check file types, sizes, and integrity.' },
                                { icon: <Download size={20} />, step: '03', title: 'Choose & Pay', desc: 'Pick your plan — Scan or Pro. Download or store in RestoreIt Cloud.' },
                                { icon: <Activity size={20} />, step: '04', title: 'Stay Protected', desc: 'Add Protection for ongoing disk monitoring and corruption alerts.' },
                            ].map((s) => (
                                <div key={s.step} className="space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-accent)] mx-auto">
                                        {s.icon}
                                    </div>
                                    <div className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-[0.3em]">Step {s.step}</div>
                                    <h3 className="text-lg font-bold">{s.title}</h3>
                                    <p className="text-sm text-zinc-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 px-6 md:px-8 border-t border-white/[0.04]">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black tracking-tight text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <details key={faq.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                                        <ArrowRight size={16} className="text-zinc-500 shrink-0 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-24 px-6 md:px-8 border-t border-white/[0.04]">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Ready to scan your drive?</h2>
                        <p className="text-zinc-500 text-lg">No installation. No disk writes. See results before you pay.</p>
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
