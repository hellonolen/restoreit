"use client";
// OnboardingOverlay — Interactive high-fidelity guide
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronRight, Activity, Cloud, Shield, HardDrive, Terminal, Cpu } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface OnboardingOverlayProps {
    onComplete: () => void;
}

const slides = [
    {
        title: "Safe Restoration",
        desc: "Other tools risk overwriting your data by installing software. RestoreIt keeps your disk completely safe by scanning in the cloud.",
        icon: <Activity className="text-[var(--color-accent)]" size={32} />,
        visual: (
            <div className="relative w-full h-48 bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                    <HardDrive size={32} className="text-red-400 opacity-50" />
                    <div className="text-[10px] text-[var(--color-text-tertiary)] font-mono">Corrupted Drive</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <ChevronRight size={24} className="text-[var(--color-accent)] animate-pulse" />
                    <div className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-widest">Secure Stream</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Cloud size={32} className="text-green-400" />
                    <div className="text-[10px] text-[var(--color-text-tertiary)] font-mono">RestoreIt Cloud</div>
                </div>
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <div className="text-[9px] text-[var(--color-text-dim)] font-mono flex items-center gap-2">
                        <Shield size={10} /> 100% Zero-Write Guarantee
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Secure Streaming",
        desc: "A lightweight command streams your drive data directly to our cloud. It writes nothing to your disk and leaves no footprint.",
        icon: <Terminal className="text-[var(--color-accent)]" size={32} />,
        visual: (
            <div className="space-y-4 w-full">
                <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-accent)]/30 font-mono text-xs text-[var(--color-accent)] leading-relaxed shadow-[0_0_20px_rgba(138,43,226,0.15)]">
                    <span className="text-[var(--color-text-tertiary)]"># Memory-only streaming activated</span><br />
                    curl -s restoreit.app/relay | bash<br />
                    <span className="text-green-400">&#10003; Connecting to RestoreIt Cloud...</span><br />
                    <span className="text-green-400">✓ Transport: TLS 1.3 AES-256</span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold px-2">
                    <span className="flex items-center gap-1"><Cpu size={10} className="text-[var(--color-accent)]" /> Volatile Memory</span>
                    <span className="flex items-center gap-1"><Shield size={10} className="text-[var(--color-accent)]" /> Encrypted Pipe</span>
                </div>
            </div>
        )
    },
    {
        title: "Cloud Restoration",
        desc: "Our cloud engine rebuilds your fragmented photos, documents, and videos, showing you live previews of restored files.",
        icon: <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center"><div className="w-2 h-2 bg-[var(--color-accent)] rounded-sm" /></div>,
        visual: (
            <div className="grid grid-cols-3 gap-3 w-full h-48">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden flex flex-col relative group">
                        <div className="flex-1 bg-[var(--color-disabled-bg)] flex items-center justify-center">
                            <span className="text-[var(--color-disabled-text)] font-mono text-[10px]">REBUILDING...</span>
                        </div>
                        <div className="p-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-card)] text-[8px] text-[var(--color-text-tertiary)] font-mono flex justify-between items-center">
                            <span>IMG_00{i}.JPG</span>
                            <span className="text-green-500">✓ FIXED</span>
                        </div>
                        <div className="absolute inset-0 bg-[var(--color-accent)]/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                    </div>
                ))}
            </div>
        )
    }
];

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
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
                className="max-w-4xl w-full rounded-[32px] border shadow-2xl overflow-hidden flex flex-col lg:flex-row bg-[var(--color-background)] border-[var(--color-border)]"
            >
                {/* Visual Side */}
                <div className="lg:w-1/2 p-12 flex flex-col justify-center items-center gap-8 bg-[var(--color-card)] border-r border-[var(--color-border)]">
                    <div className="w-full animate-in zoom-in-95 duration-500">
                        {slides[currentStep].visual}
                    </div>
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentStep === i ? 'w-8 bg-[var(--color-accent)]' : 'w-2 bg-[var(--color-disabled-bg)]'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-1/2 p-12 flex flex-col relative">
                    <button onClick={onComplete} className="absolute top-8 right-8 text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] transition-colors">
                        <X size={20} />
                    </button>

                    <div className="mb-12">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mb-8">
                            {slides[currentStep].icon}
                        </div>
                        <h2 className="text-3xl font-bold mb-6 animate-in slide-in-from-bottom-2 duration-500 text-[var(--color-foreground)]">
                            {slides[currentStep].title}
                        </h2>
                        <p className="text-lg leading-relaxed animate-in slide-in-from-bottom-3 duration-500 delay-100 text-[var(--color-text-secondary)]">
                            {slides[currentStep].desc}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                        <button onClick={onComplete} className="text-sm font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors">
                            Skip Guide
                        </button>
                        <button onClick={next} className="group bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--color-accent)]/25 flex items-center gap-3">
                            {currentStep === slides.length - 1 ? 'Get Started' : 'Next Step'}
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
