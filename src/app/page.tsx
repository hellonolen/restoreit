import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, ChevronRight, ArrowDown } from 'lucide-react';
import { PLATFORM_STATS } from '@/lib/demo-data';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[var(--color-accent)]/30 flex flex-col font-sans">
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
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              What most people do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-500">after losing a file makes things worse.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Every second you spend installing more software to get it back is another second spent overwriting what you&apos;ve lost.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/restore" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>

          <div className="pt-16 flex items-center justify-center animate-bounce opacity-30">
            <ArrowDown size={28} />
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-24 md:py-32 px-6 md:px-8 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-24 md:space-y-32">
          <div className="text-center space-y-4">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">See It In Action</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Here&apos;s what the scan looks like.</h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              Zero write operations to your drive. The relay runs entirely in memory and streams your sectors to our cloud engine in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-24 md:gap-32">
            {/* Scan Interface */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-[#B066FF] rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero_scan.png"
                  alt="RestoreIt scanning interface"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">Sector-by-sector scanning</h3>
                  <p className="text-zinc-500 text-base md:text-lg leading-relaxed font-medium">
                    The relay reads your drive sector by sector and streams the data to our cloud engine. Nothing is written to your disk at any point.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['Zero Disk Writes', 'Live Progress', 'Encrypted Stream', 'Pause & Resume'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* File Browser */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500 to-zinc-900 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-black rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/file_browser.png"
                  alt="Restored files browser"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4 order-2 md:order-1">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">See what the scan finds</h3>
                  <p className="text-zinc-500 text-base md:text-lg leading-relaxed font-medium">
                    Browse scan results by file type, check integrity scores, and decide whether to proceed.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap order-1 md:order-2">
                  {['File Preview', 'Integrity Scores', 'Search & Filter', 'Selective Restoration'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-black rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/dashboard.png"
                  alt="RestoreIt account dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">Manage everything in one place</h3>
                  <p className="text-zinc-500 text-base md:text-lg leading-relaxed font-medium">
                    Track scan history, manage RestoreIt Cloud storage, monitor disk health, and access your files — all from your dashboard.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['Restoration History', 'RestoreIt Cloud', 'Disk Monitoring', 'Secure Downloads'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 md:px-8 bg-black relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 space-y-4">
            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">How It Works</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Five simple steps.</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Describe', desc: 'Tell us what happened and which drive to scan.' },
              { step: '02', title: 'Select', desc: 'Choose the drive. Run the relay command.' },
              { step: '03', title: 'Scan', desc: 'The relay streams your drive to our cloud engine.' },
              { step: '04', title: 'Preview', desc: 'See exactly which files are restorable before you pay.' },
              { step: '05', title: 'Unlock', desc: 'Choose your plan. Download your restored files.' },
            ].map((item) => (
              <div key={item.step} className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[var(--color-accent)]/30 transition-all">
                <div className="text-zinc-800 font-black text-3xl md:text-4xl mb-6 group-hover:text-[var(--color-accent)]/40 transition-colors">{item.step}</div>
                <h3 className="text-base md:text-lg font-black tracking-tight mb-2">{item.title}</h3>
                <p className="text-zinc-600 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-24 md:py-32 px-6 md:px-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {PLATFORM_STATS.map(stat => (
            <div key={stat.label} className="space-y-2">
              <div className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">{stat.label}</div>
              <div className="text-3xl md:text-4xl font-light tracking-tighter text-white">{stat.value}</div>
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
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            RestoreIt scans your drive without writing a single byte. See your restorable files before you pay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/restore" className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Get Started <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
