"use client";
// OnboardingOverlay — Interactive high-fidelity guide
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronRight, Activity, Cloud, Shield, HardDrive, Terminal, Cpu } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface OnboardingOverlayProps {
    onComplete: () => void;
    darkMode: boolean;
}

const slides = [
    {
        title: "Zero-Install Recovery",
        desc: "Existing tools overwrite your data by installing software. RestoreIt separates computation from disk access, ensuring 100% disk safety.",
        icon: <Activity className="text-[#8A2BE2]" size={32} />,
        visual: (
            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                    <HardDrive size={32} className="text-red-400 opacity-50" />
                    <div className="text-[10px] text-zinc-500 font-mono">Corrupted Drive</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <ChevronRight size={24} className="text-[#8A2BE2] animate-pulse" />
                    <div className="text-[10px] text-[#8A2BE2] font-bold uppercase tracking-widest">Relay Pipe</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Cloud size={32} className="text-green-400" />
                    <div className="text-[10px] text-zinc-500 font-mono">RestoreIt Cloud</div>
                </div>
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <div className="text-[9px] text-zinc-600 font-mono flex items-center gap-2">
                        <Shield size={10} /> 100% Zero-Write Guarantee
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "The Secure Relay Pipe",
        desc: "A tiny, memory-only command streams raw sectors directly to our Cloud Forensics Agents. It writes nothing to your disk and leaves no footprint.",
        icon: <Terminal className="text-[#8A2BE2]" size={32} />,
        visual: (
            <div className="space-y-4 w-full">
                <div className="p-4 rounded-xl bg-black/60 border border-[#8A2BE2]/30 font-mono text-xs text-[#8A2BE2] leading-relaxed shadow-[0_0_20px_rgba(138,43,226,0.15)]">
                    <span className="text-zinc-500"># Memory-only streaming activated</span><br />
                    curl -s restoreit.app/relay | bash<br />
                    <span className="text-green-400">✓ Connecting to Cloud Forensics...</span><br />
                    <span className="text-green-400">✓ Transport: TLS 1.3 AES-256</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-2">
                    <span className="flex items-center gap-1"><Cpu size={10} className="text-[#8A2BE2]" /> Volatile Memory</span>
                    <span className="flex items-center gap-1"><Shield size={10} className="text-[#8A2BE2]" /> Encrypted Pipe</span>
                </div>
            </div>
        )
    },
    {
        title: "RestoreIt Reconstruction",
        desc: "Our Cloud Agents rebuild your fragmented JPEGs, PDFs, and MP4s sector-by-sector, proving recovery with direct 'Proof of Life' previews.",
        icon: <div className="w-8 h-8 rounded-lg bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center"><div className="w-2 h-2 bg-[#8A2BE2] rounded-sm" /></div>,
        visual: (
            <div className="grid grid-cols-3 gap-3 w-full h-48">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl border border-white/10 bg-black/40 overflow-hidden flex flex-col relative group">
                        <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <span className="text-zinc-700 font-mono text-[10px]">REBUILDING...</span>
                        </div>
                        <div className="p-2 border-t border-white/5 bg-black/20 text-[8px] text-zinc-500 font-mono flex justify-between items-center">
                            <span>IMG_00{i}.JPG</span>
                            <span className="text-green-500">✓ FIXED</span>
                        </div>
                        <div className="absolute inset-0 bg-[#8A2BE2]/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                    </div>
                ))}
            </div>
        )
    }
];

export default function OnboardingOverlay({ onComplete, darkMode }: OnboardingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onComplete);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setActive(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const next = useCallback(() => {
        if (currentStep < slides.length - 1) setCurrentStep(s => s + 1);
        else onComplete();
    }, [currentStep, onComplete]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onComplete();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', down);
        return () => window.removeEventListener('keydown', down);
    }, [next, onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl transition-all duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
            <div
                ref={modalRef}
                className={`max-w-4xl w-full rounded-[32px] border shadow-[0_0_100px_rgba(138,43,226,0.15)] overflow-hidden flex flex-col lg:flex-row ${darkMode ? 'bg-[#0D0D0F] border-white/10' : 'bg-white border-black/10'}`}
            >
                {/* Visual Side */}
                <div className={`lg:w-1/2 p-12 flex flex-col justify-center items-center gap-8 ${darkMode ? 'bg-black/40 border-r border-white/5' : 'bg-zinc-50 border-r border-black/5'}`}>
                    <div className="w-full animate-in zoom-in-95 duration-500">
                        {slides[currentStep].visual}
                    </div>
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentStep === i ? 'w-8 bg-[#8A2BE2]' : 'w-2 bg-zinc-800'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-1/2 p-12 flex flex-col relative">
                    <button onClick={onComplete} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>

                    <div className="mb-12">
                        <div className="w-14 h-14 rounded-2xl bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center mb-8">
                            {slides[currentStep].icon}
                        </div>
                        <h2 className={`text-3xl font-bold mb-6 animate-in slide-in-from-bottom-2 duration-500 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                            {slides[currentStep].title}
                        </h2>
                        <p className={`text-lg leading-relaxed animate-in slide-in-from-bottom-3 duration-500 delay-100 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {slides[currentStep].desc}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                        <button onClick={onComplete} className="text-sm font-semibold text-zinc-600 hover:text-[#8A2BE2] transition-colors">
                            Skip Guide
                        </button>
                        <button onClick={next} className="group bg-[#8A2BE2] hover:bg-[#7e22ce] text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[#8A2BE2]/25 flex items-center gap-3">
                            {currentStep === slides.length - 1 ? 'Get Started' : 'Next Step'}
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
