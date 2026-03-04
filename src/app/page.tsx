"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, ChevronRight, ArrowDown } from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#8A2BE2]/30 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-white/[0.04] bg-black/50 backdrop-blur-xl">
        <Link href="/" className="group flex items-center gap-4 transition-all duration-700">
          <div className="w-10 h-10 rounded-xl bg-[#8A2BE2] flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.3)] group-hover:scale-110 transition-transform">
            <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-[0.4em] text-white">restoreit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          <Link href="/restore" className="px-6 py-2.5 rounded-xl bg-[#8A2BE2] text-white hover:bg-[#7e22ce] transition-all shadow-lg shadow-[#8A2BE2]/20">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#8A2BE2]/20 to-transparent blur-[120px] opacity-40" />
        </div>

        <div className="w-full max-w-6xl space-y-16 text-center relative z-10">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#8A2BE2] text-[9px] font-black uppercase tracking-[0.25em]">
              <Shield size={10} strokeWidth={3} /> Forensic restore Protocol v4.9
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] text-white">
              Beyond Restore. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-500">Restore.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
              restoreit is the definitive forensic standard for bit-level file restore, fragments restore, and hardened cloud storage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <Link href="/restore" className="w-full sm:w-auto h-20 px-12 rounded-3xl bg-[#8A2BE2] hover:bg-[#7e22ce] text-white text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Start Restore <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto h-20 px-12 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] text-white text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95">
              Analyst Dashboard
            </Link>
          </div>

          <div className="pt-24 flex items-center justify-center animate-bounce opacity-30">
            <ArrowDown size={32} />
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-32 px-8 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-4">
            <div className="text-[#8A2BE2] text-[10px] font-black uppercase tracking-[0.3em]">Visual Evidence</div>
            <h2 className="text-5xl font-black tracking-tighter">Forensic Precision.</h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed">
              Every byte is scrutinized. Every fragment is audited. Experience the most sophisticated restore engine ever built.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-40">
            {/* Hero Scan Image */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8A2BE2] to-[#B066FF] rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero_scan.png"
                  alt="Forensic Scan Interface"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-black tracking-tight">Active Sector Scrutiny</h3>
                  <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                    The restoreit Cloud parses raw disk geometry in real-time, mapping binary entropy and identifying fragmented file signatures with 99.4% accuracy.
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {['Bit-Level Analysis', 'Entropy Mapping', 'Raw Sector Streaming', 'Real-time Stats'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* File Browser Image */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500 to-zinc-900 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-black rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/file_browser.png"
                  alt="Extraction Browser"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 order-2 md:order-1">
                  <h3 className="text-3xl font-black tracking-tight">Forensic Extraction Library</h3>
                  <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                    Audit restored data before deployment. Filter by hex signature, owner UID, or entropy depth. restoreit ensures you only restore what matters.
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap order-1 md:order-2">
                  {['Hex Signature Audit', 'Entropy Filtering', 'Selective Extraction', 'Metadata Restoration'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dashboard Image */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8A2BE2] to-transparent rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-black rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/images/dashboard.png"
                  alt="restoreit Dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-black tracking-tight">restoreit Dashboard</h3>
                  <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                    Your forensic command center. Monitor disk health across multi-node arrays, manage encrypted extraction keys, and view global restore trends.
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {['Multi-Node Monitoring', 'AES-256 Key Management', 'Health Diagnostics', 'Audit Logs'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Flow Section */}
      <section className="py-32 px-8 bg-black relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24 space-y-4">
            <div className="text-[#8A2BE2] text-[10px] font-black uppercase tracking-[0.3em]">The Protocol</div>
            <h2 className="text-5xl font-black tracking-tighter text-white">The Restore Protocol.</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Briefing', desc: 'Symptomatic data loss diagnostic.' },
              { step: '02', title: 'Targeting', desc: 'Volume selection & sector mapping.' },
              { step: '03', title: 'Relay', desc: 'Deep sector carving & streaming.' },
              { step: '04', title: 'Audit', desc: 'restore validity check.' },
              { step: '05', title: 'Unlock', desc: 'restoreit Cloud delivery.' },
            ].map((item) => (
              <div key={item.step} className="group p-8 rounded-[32px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#8A2BE2]/30 transition-all">
                <div className="text-zinc-800 font-black text-4xl mb-6 group-hover:text-[#8A2BE2]/40 transition-colors">{item.step}</div>
                <h3 className="text-lg font-black tracking-tight mb-3">{item.title}</h3>
                <p className="text-zinc-600 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Stats */}
      <section className="py-32 px-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          {[
            { label: 'Uptime Integrity', value: '99.99%', sub: 'SLA Guaranteed' },
            { label: 'Extraction Velocity', value: '18GB/s', sub: 'Peak Network Thruput' },
            { label: 'Encryption Level', value: 'AES-256', sub: 'Standard Hardening' },
            { label: 'Fragments Restored', value: '1.2B+', sub: 'Last 24 Hours' },
          ].map(stat => (
            <div key={stat.label} className="space-y-2">
              <div className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">{stat.label}</div>
              <div className="text-4xl font-light tracking-tighter text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#8A2BE2] uppercase tracking-widest">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Master CTA */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#8A2BE2]/5"></div>
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight">
            Your data isn&apos;t gone. <br />
            It&apos;s just <span className="text-[#8A2BE2]">defragmented.</span>
          </h2>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto font-medium">
            Join 240,000+ professionals who trust the restoreit Cloud for forensic-grade data survival.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/restore" className="w-full sm:w-auto h-20 px-16 rounded-3xl bg-[#8A2BE2] hover:bg-[#7e22ce] text-white text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
              Commit to Restore <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 border-t border-white/[0.04] bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#8A2BE2] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm rotate-45"></div>
              </div>
              <span className="text-base font-black tracking-[0.4em] text-white uppercase">restoreit</span>
            </Link>
            <p className="text-zinc-600 max-w-sm text-sm leading-relaxed font-medium">
              The gold standard in forensic data restore. Operating at the binary level to ensure no data is permanently lost.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Engineering</div>
            <nav className="flex flex-col gap-4 text-xs font-bold text-zinc-600">
              <Link href="/restore" className="hover:text-white transition-colors">Start Restore</Link>
              <Link href="/account/protection" className="hover:text-white transition-colors">Monitoring Hub</Link>
              <Link href="/support" className="hover:text-white transition-colors">SLA & Documentation</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Legal</div>
            <nav className="flex flex-col gap-4 text-xs font-bold text-zinc-600">
              <Link href="/terms" className="hover:text-white transition-colors">Forensic Protocol</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Custody</Link>
              <Link href="/login" className="hover:text-white transition-colors">Secure Sign-in</Link>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/[0.04]">
          <div className="flex items-center gap-4 text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em]">
            <span>© 2026 restoreit. ALL RIGHTS RESERVED.</span>
            <div className="w-1 h-1 rounded-full bg-zinc-900" />
            <span>BK-4922 NODE ACTIVE</span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-8 text-[9px] font-black text-zinc-600 uppercase tracking-widest mr-8">
              <Link href="/terms" className="hover:text-white transition-colors">Protocol</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Custody</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </nav>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">restoreit Cloud: Nominal</span>
          </div>
        </div>
      </footer>

      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>
    </div>
  );
}
