"use client";
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { StepType } from '../types';
import Link from 'next/link';

interface SidebarProps {
    currentStep: StepType;
    onRestart?: () => void;
}

const steps = [
    { id: 1 as StepType, label: 'Describe', desc: 'Tell us what happened' },
    { id: 2 as StepType, label: 'Select Drive', desc: 'Choose your drive' },
    { id: 3 as StepType, label: 'Scanning', desc: 'Cloud scan in progress' },
    { id: 4 as StepType, label: 'Results', desc: 'Your restored files' },
    { id: 5 as StepType, label: 'Download', desc: 'Get your files back' },
];

export default function Sidebar({ currentStep, onRestart }: SidebarProps) {
    return (
        <aside className="w-72 shrink-0 border-r py-12 px-8 flex flex-col sticky top-0 h-[calc(100vh-80px)] border-[var(--color-border)]" aria-label="Restore steps">
            <div className="flex-1 space-y-1">
                <div className="mb-8">
                    <button
                        onClick={onRestart}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] hover:border-[var(--color-accent)]/30"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Start Over</span>
                    </button>
                </div>

                {steps.map(step => {
                    const done = currentStep > step.id;
                    const active = currentStep === step.id;
                    return (
                        <div key={step.id} className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-all ${active ? 'bg-[var(--color-accent)]/5' : ''}`}>
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${done
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                    : active
                                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-accent)]'
                                        : 'bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-dim)]'
                                }`}>
                                {done ? <CheckCircle2 size={14} /> : (
                                    <span className={`text-xs font-bold ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>{step.id}</span>
                                )}
                            </div>
                            <div>
                                <div className={`text-sm font-semibold ${active ? 'text-[var(--color-foreground)]' : done ? 'text-green-400' : 'text-[var(--color-text-dim)]'}`}>{step.label}</div>
                                <div className={`text-[10px] mt-0.5 ${active ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-dim)]'} font-medium`}>{step.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-[var(--color-border-subtle)] space-y-3 text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-dim)]">
                <Link href="/account" className="block hover:text-[var(--color-accent)] transition-colors">My Account</Link>
                <Link href="/support" className="block hover:text-[var(--color-accent)] transition-colors">Help & Support</Link>
                <Link href="/terms" className="block hover:text-[var(--color-accent)] transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block hover:text-[var(--color-accent)] transition-colors">Privacy Policy</Link>
                <div className="pt-2 text-[var(--color-disabled-text)] text-[9px] font-black tracking-normal uppercase">Encrypted · Zero disk writes</div>
            </div>
        </aside>
    );
}
