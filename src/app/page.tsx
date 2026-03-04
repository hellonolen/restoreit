import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, ChevronRight, ArrowDown } from 'lucide-react';
import { PLATFORM_STATS } from '@/lib/demo-data';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] selection:bg-[var(--color-accent)]/30 flex flex-col font-sans transition-colors duration-300">
      <SiteHeader />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[var(--color-accent)]/20 to-transparent blur-[120px] opacity-40" />
        </div>

        <div className="w-full max-w-5xl space-y-14 text-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Shield size={10} strokeWidth={3} /> Stop. Do not write anything to your drive.
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              What most people do <br />
              <span className="text-[var(--color-text-secondary)]">after losing a file makes things worse.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-tertiary)] font-medium max-w-2xl mx-auto leading-relaxed">
              Every second you spend installing more software to get it back is another second spent overwriting what you&apos;ve lost.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/pricing" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>

          <div className="pt-16 flex items-center justify-center animate-bounce opacity-30">
            <ArrowDown size={28} />
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <Image src="/images/scan_intake.png" alt="RestoreIt scan intake" width={2880} height={1800} className="w-full h-auto" />
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <Image src="/images/cloud_vault.png" alt="RestoreIt Cloud file storage" width={2880} height={1800} className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 md:px-8 bg-[var(--color-background)] relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 space-y-4">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">How It Works</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Five simple steps.</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Describe', desc: 'Tell us what happened and which drive to scan.' },
              { step: '02', title: 'Select', desc: 'Choose the drive. Run the relay command.' },
              { step: '03', title: 'Scan', desc: 'The relay streams your drive to our cloud engine.' },
              { step: '04', title: 'Preview', desc: 'See what the scan detected before you pay.' },
              { step: '05', title: 'Unlock', desc: 'Choose your plan. Download your restored files.' },
            ].map((item) => (
              <div key={item.step} className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-[var(--color-border-subtle)] bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] hover:border-[var(--color-accent)]/30 transition-all">
                <div className="text-[var(--color-text-dim)] font-black text-3xl md:text-4xl mb-6 group-hover:text-[var(--color-accent)]/40 transition-colors">{item.step}</div>
                <h3 className="text-base md:text-lg font-black tracking-tight mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-dim)] text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-24 md:py-32 px-6 md:px-8 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {PLATFORM_STATS.map(stat => (
            <div key={stat.label} className="space-y-2">
              <div className="text-[var(--color-text-dim)] text-[9px] font-black uppercase tracking-widest">{stat.label}</div>
              <div className="text-3xl md:text-4xl font-light tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Master CTA */}
      <section className="py-24 md:py-40 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            Zero write operations <br />
            to your affected drive.
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto font-medium">
            RestoreIt scans your drive without writing a single byte. See what the scan finds before you pay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/pricing" className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Get Started <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
