'use client'

import { Suspense, useState } from 'react'
import { ArrowRight, Check, Lock, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PARTNER_TIERS } from '@/lib/partner-constants'

const LOCATION_OPTIONS = [1, 2, 3, 4, 5] as const

function PartnerCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTier = searchParams.get('tier') ?? 'growth'
  const initialLocations = Math.max(1, Math.min(5, Math.floor(Number(searchParams.get('locations') ?? '1')) || 1))

  const [selectedTier, setSelectedTier] = useState(initialTier)
  const [locations, setLocations] = useState(initialLocations)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const tier = PARTNER_TIERS.find(t => t.slug === selectedTier) ?? PARTNER_TIERS[1]
  const total = tier.price * locations

  const handleCheckout = async () => {
    setIsProcessing(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          locations,
          type: 'partner',
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({ error: 'Checkout failed' }))) as { error?: string }
        setError(data.error || 'Could not start checkout.')
        setIsProcessing(false)
        return
      }

      const { url } = (await res.json()) as { url?: string }
      if (url) {
        window.location.href = url
      } else {
        setError('No checkout URL returned.')
        setIsProcessing(false)
      }
    } catch {
      setError('Connection error. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col selection:bg-[var(--color-accent)]/30 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-[var(--color-border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-base font-bold tracking-wide">RESTOREIT</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card-hover)] border border-[var(--color-border)] text-xs tracking-widest text-[var(--color-text-secondary)] font-medium rounded-lg">
          <Lock size={12} /> PARTNER CHECKOUT
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1100px] w-full mx-auto py-12 lg:py-20 gap-12 lg:gap-16 px-6">
        {/* Left: Tier Selection */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-3">Partner Subscription</h1>
            <p className="text-[var(--color-text-tertiary)] text-lg leading-relaxed max-w-lg">
              Flat monthly pricing. No per-GB metering. Scale by adding locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PARTNER_TIERS.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSelectedTier(t.slug)}
                className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  selectedTier === t.slug
                    ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                    : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]'
                }`}
              >
                {t.recommended && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-800" />
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{t.name}</h3>
                    {t.recommended && (
                      <span className="text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-wider">Recommended</span>
                    )}
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border-focus)] flex items-center justify-center">
                    {selectedTier === t.slug && <div className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full" />}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  ${t.price}<span className="text-[var(--color-text-dim)] text-base font-normal">{t.period}</span>
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] mb-4">per location</div>
                <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <Check size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                    {t.scanVolume} scan volume
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                    {t.jobLimit}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                    {t.rateLimit}
                  </li>
                </ul>
              </button>
            ))}
          </div>

          {/* Location selector */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={20} className="text-[var(--color-accent)]" />
              <h3 className="font-bold">Number of Locations</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {LOCATION_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLocations(n)}
                  className={`h-12 rounded-xl border text-sm font-bold transition-all ${
                    locations === n
                      ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-focus)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-dim)] mt-3">
              Each location gets full API access with your tier&apos;s volume and rate limits.
            </p>
          </div>

          {/* Features */}
          <div className="p-5 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
            <h4 className="text-sm font-bold mb-3">Included with {tier.name}</h4>
            <ul className="space-y-2">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Check size={14} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-[var(--color-background-elevated)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl sticky top-8 space-y-6">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="text-3xl font-bold tracking-tight">
                ${total}<span className="text-[var(--color-text-tertiary)] text-base">.00</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>{tier.name} Partner Plan</span>
                <span className="text-[var(--color-foreground)]">${tier.price}.00</span>
              </div>
              {locations > 1 && (
                <div className="flex justify-between text-[var(--color-text-dim)] text-xs">
                  <span>${tier.price}{tier.period} x {locations} locations</span>
                  <span>${total}.00</span>
                </div>
              )}
              <div className="border-t border-[var(--color-border-subtle)] pt-3">
                <div className="flex justify-between text-xs text-[var(--color-text-dim)] mb-1">
                  <span>Scan Volume</span>
                  <span>{tier.scanVolume}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-dim)] mb-1">
                  <span>Job Limit</span>
                  <span>{tier.jobLimit}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
                  <span>Rate Limit</span>
                  <span>{tier.rateLimit}</span>
                </div>
              </div>
              <div className="border-t border-[var(--color-border-subtle)] pt-3 flex justify-between font-bold">
                <span>Monthly Total</span>
                <span>${total}.00{tier.period}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isProcessing
                  ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed border border-[var(--color-border-subtle)]'
                  : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-foreground)] rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>Subscribe — ${total}{tier.period} <ArrowRight size={16} /></>
              )}
            </button>

            <p className="text-[10px] text-[var(--color-text-dim)] text-center leading-relaxed">
              You&apos;ll be securely redirected to Whop to complete payment. Cancel anytime from your partner dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PartnerCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    }>
      <PartnerCheckoutContent />
    </Suspense>
  )
}
