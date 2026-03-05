import Link from 'next/link'
import { ArrowRight, Shield, Zap, Server, Lock, Code2, BarChart3 } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata = {
  title: 'restoreit-as-a-Service API — restoreit',
  description: 'Add restoreit to your product. REST API for IT service providers, MSPs, and repair shops.',
}

export default function RaasDocsPage() {
  const capabilities = [
    { icon: <Server size={20} />, title: 'Job Lifecycle Management', desc: 'Create, monitor, and manage restore jobs end-to-end via REST endpoints.' },
    { icon: <Zap size={20} />, title: 'Chunked Disk Upload', desc: 'Stream disk images in optimized chunks with automatic reassembly and integrity checks.' },
    { icon: <Code2 size={20} />, title: 'Webhook-Driven Results', desc: 'Receive real-time job completion notifications and file manifests via signed webhooks.' },
    { icon: <Shield size={20} />, title: 'HMAC-SHA256 Security', desc: 'Every webhook payload is cryptographically signed — verify authenticity before processing.' },
    { icon: <BarChart3 size={20} />, title: 'Usage Tracking', desc: 'Monitor jobs created, data scanned, and files restored across your billing period.' },
    { icon: <Lock size={20} />, title: 'MCP Server', desc: 'Connect AI agents directly to restoreit via Model Context Protocol — no code required.' },
  ]

  const tiers = [
    { name: 'Starter', price: '$199', period: '/mo', rate: '30 req/min', quota: '100 GB', highlight: false },
    { name: 'Growth', price: '$599', period: '/mo', rate: '120 req/min', quota: '1 TB', highlight: true },
    { name: 'Enterprise', price: 'Custom', period: '', rate: 'Custom', quota: 'Custom', highlight: false },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1 pt-28">
        {/* Hero */}
        <section className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">
              restoreit-as-a-Service
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              Add restoreit<br />to your product.
            </h1>
            <p className="text-lg text-[var(--color-text-tertiary)] max-w-xl leading-relaxed">
              A REST API that lets IT service providers, MSPs, and repair shops offer professional-grade
              file recovery without building recovery infrastructure.
            </p>

            {/* Redacted sample */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden max-w-lg">
              <div className="px-5 py-2.5 border-b border-[var(--color-border)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                Quick Start
              </div>
              <pre className="p-5 text-xs leading-relaxed overflow-x-auto" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                <code className="text-[var(--color-accent)]">{`curl -X POST https://restoreit.app/api/v1/restore/jobs \\
  -H "Authorization: Bearer ri_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{ "drive_name": "...", "mode": "deep" }'

# → { "job_id": "job_•••", "upload_url": "..." }`}</code>
              </pre>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--color-text-dim)] flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                7 REST Endpoints
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                MCP Server
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                Webhook Callbacks
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                Bearer Auth
              </span>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-2xl font-black tracking-tight">What the API & MCP do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {capabilities.map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-3">
                  <div className="text-[var(--color-accent)]">{icon}</div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black tracking-tight">Partner Plans</h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">Full API documentation is available after registration.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers.map((tier) => (
                <div key={tier.name} className={`rounded-2xl border p-6 space-y-5 ${tier.highlight ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] ring-1 ring-[var(--color-accent)]/20' : 'border-[var(--color-border)] bg-[var(--color-card)]'}`}>
                  <div>
                    <div className="text-sm font-bold">{tier.name}</div>
                    <div className="text-3xl font-black mt-2">{tier.price}<span className="text-sm font-normal text-[var(--color-text-tertiary)]">{tier.period}</span></div>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                    <div className="flex justify-between"><span>Rate Limit</span><span className="font-bold text-[var(--color-foreground)]">{tier.rate}</span></div>
                    <div className="flex justify-between"><span>Monthly Volume</span><span className="font-bold text-[var(--color-foreground)]">{tier.quota}</span></div>
                  </div>
                  <Link
                    href="/checkout/partner"
                    className={`block text-center h-11 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all ${tier.highlight ? 'bg-[var(--color-accent)] text-white hover:opacity-90 shadow-[0_10px_30px_rgba(138,43,226,0.2)]' : 'border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-card-hover)]'}`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-2xl font-black tracking-tight">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { step: '01', title: 'Create Job', desc: 'Submit a restore request with drive metadata.' },
                { step: '02', title: 'Upload Image', desc: 'Stream the disk image in optimized chunks.' },
                { step: '03', title: 'Receive Webhook', desc: 'Get notified when recovery is complete.' },
                { step: '04', title: 'Download Files', desc: 'Retrieve recovered files via presigned URLs.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="space-y-3">
                  <div className="text-[var(--color-accent)] text-[10px] font-black tracking-[0.3em]">{step}</div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Start building today.</h2>
            <p className="text-[var(--color-text-tertiary)] text-lg">
              Register as a partner and access full API documentation, code samples, and your dedicated API key.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 bg-[var(--color-accent)] hover:opacity-90 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.25)] active:scale-[0.98]"
            >
              Register as Partner <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
