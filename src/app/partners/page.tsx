'use client'

import Link from 'next/link'
import { ArrowRight, Upload, Search, Download, Code, Bell, BarChart3, Link2, Gauge, Layers, Check, ChevronRight } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { PARTNER_TIERS, PARTNER_FAQS } from '@/lib/partner-constants'

export default function PartnersPage() {

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1 pt-28">
        {/* Hero */}
        <section className="py-24 md:py-32 px-6 md:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
              Restore-as-a-Service
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              Turn your repair shop into a restoreit service.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-tertiary)] max-w-xl mx-auto leading-relaxed">
              Upload disk images, preview files, deliver restores. No installs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="h-14 px-10 rounded-2xl bg-[var(--color-accent)] text-white font-black text-sm uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)] hover:opacity-90 active:scale-[0.98]"
              >
                Register as Partner <ArrowRight size={16} />
              </Link>
              <Link
                href="/docs/raas"
                className="h-14 px-10 rounded-2xl border border-[var(--color-border)] text-[var(--color-foreground)] font-black text-sm uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-[var(--color-card-hover)] transition-all"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
                How It Works
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Three API calls. That&apos;s it.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Upload size={24} />, step: '01', title: 'Upload', desc: 'POST a disk image via presigned upload. We accept raw, E01, and dd formats up to 2TB.' },
                { icon: <Search size={24} />, step: '02', title: 'Scan', desc: 'Our engine carves file signatures, reconstructs fragments, and scores integrity automatically.' },
                { icon: <Download size={24} />, step: '03', title: 'Restore', desc: 'List recovered files, preview metadata, and download via presigned URLs. Deliver to your customer.' },
              ].map((s) => (
                <div key={s.step} className="p-6 md:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto">
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-[0.3em]">Step {s.step}</div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
                What You Get
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Everything you need to ship restores.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Code size={20} />, title: 'REST API', desc: 'Full CRUD lifecycle for restore jobs. Create, upload, poll, list files, download.' },
                { icon: <Bell size={20} />, title: 'Webhooks', desc: 'Real-time HMAC-signed notifications when scans complete, fail, or need attention.' },
                { icon: <BarChart3 size={20} />, title: 'Usage Dashboard', desc: 'Track jobs, GB scanned, files restored, and estimated revenue in real time.' },
                { icon: <Link2 size={20} />, title: 'Presigned Downloads', desc: 'Stream restored files directly to your customer. No intermediate storage needed.' },
                { icon: <Gauge size={20} />, title: 'Rate Limiting', desc: 'Tier-based rate limits with clear headers. Scale from 100 to unlimited req/min.' },
                { icon: <Layers size={20} />, title: 'Scan Modes', desc: 'Quick scan for speed, deep scan for maximum recovery. Choose per job.' },
              ].map((f) => (
                <div key={f.title} className="p-6 md:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-card-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
                Pricing
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                One price. No surprises.
              </h2>
              <p className="text-[var(--color-text-tertiary)] max-w-lg mx-auto">
                Flat monthly pricing based on scan volume. Pick your tier and go.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {PARTNER_TIERS.map((tier) => (
                <div
                  key={tier.slug}
                  className={`relative rounded-3xl border p-8 flex flex-col ${tier.recommended
                    ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] ring-1 ring-[var(--color-accent)]/20'
                    : 'border-[var(--color-border)] bg-[var(--color-card)]'
                    }`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-accent)]/30">
                      Recommended
                    </div>
                  )}
                  <div className="mb-6 space-y-4">
                    <h3 className="text-2xl font-black">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black">${tier.price}</span>
                      <span className="text-[var(--color-text-tertiary)] text-lg">{tier.period}</span>
                    </div>
                    <div className="text-sm text-[var(--color-text-tertiary)] space-y-1">
                      <div>{tier.scanVolume} scan volume &middot; {tier.jobLimit}</div>
                      <div>{tier.rateLimit}</div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                        <Check size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/checkout/partner?tier=${tier.slug}`}
                    className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${tier.recommended
                      ? 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                      : 'border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] text-[var(--color-foreground)]'
                      }`}
                  >
                    Get Started <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tested & Verified */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                <Check size={24} className="text-green-400" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-1">Tested &amp; Verified</div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  58/58 end-to-end tests passed on 2026-03-04. Every endpoint, webhook, upload flow, and download path is covered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-3xl font-black tracking-tight text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {PARTNER_FAQS.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="text-sm font-bold pr-4">{faq.question}</span>
                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Ready to offer restores?</h2>
            <p className="text-[var(--color-text-tertiary)] text-lg">
              Create an account, register as a partner, and start sending jobs today.
            </p>
            <Link
              href="/checkout/partner?tier=growth"
              className="inline-flex items-center gap-3 bg-[var(--color-accent)] hover:opacity-90 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)] active:scale-[0.98]"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
