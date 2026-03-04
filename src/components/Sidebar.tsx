"use client";
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { StepType } from '../types';
import Link from 'next/link';

interface SidebarProps {
    currentStep: StepType;
    darkMode: boolean;
    onRestart?: () => void;
}

const steps = [
    { id: 1 as StepType, label: 'Describe', desc: 'Tell us what happened' },
    { id: 2 as StepType, label: 'Select Drive', desc: 'Choose your drive' },
    { id: 3 as StepType, label: 'Scanning', desc: 'Cloud scan in progress' },
    { id: 4 as StepType, label: 'Results', desc: 'Your restored files' },
    { id: 5 as StepType, label: 'Download', desc: 'Get your files back' },
];

export default function Sidebar({ currentStep, darkMode, onRestart }: SidebarProps) {
    return (
        <aside className={`w-72 shrink-0 border-r py-12 px-8 flex flex-col sticky top-0 h-[calc(100vh-80px)] ${darkMode ? 'border-[#ffffff08]' : 'border-black/5'}`} aria-label="Restore steps">
            <div className="flex-1 space-y-1">
                <div className="mb-8">
                    <button
                        onClick={onRestart}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${darkMode
                                ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-[#8A2BE2]/30'
                                : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-[#8A2BE2]/30'
                            }`}
                    >
                        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Start Over</span>
                    </button>
                </div>

                {steps.map(step => {
                    const done = currentStep > step.id;
                    const active = currentStep === step.id;
                    return (
                        <div key={step.id} className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-all ${active ? darkMode ? 'bg-[#8A2BE2]/5' : 'bg-[#8A2BE2]/5' : ''}`}>
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${done
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                    : active
                                        ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50 text-[#8A2BE2]'
                                        : darkMode ? 'bg-white/5 border-white/10 text-zinc-600' : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                                }`}>
                                {done ? <CheckCircle2 size={14} /> : (
                                    <span className={`text-xs font-bold ${active ? 'text-[#8A2BE2]' : darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.id}</span>
                                )}
                            </div>
                            <div>
                                <div className={`text-sm font-semibold ${active ? darkMode ? 'text-white' : 'text-zinc-900' : done ? 'text-green-400' : darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.label}</div>
                                <div className={`text-[10px] mt-0.5 ${active ? darkMode ? 'text-zinc-400' : 'text-zinc-500' : 'text-zinc-600'} font-medium`}>{step.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={`pt-8 border-t ${darkMode ? 'border-white/5' : 'border-black/5'} space-y-3 text-[10px] uppercase font-bold tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                <Link href="/account" className="block hover:text-[#8A2BE2] transition-colors">My Account</Link>
                <Link href="/support" className="block hover:text-[#8A2BE2] transition-colors">Help & Support</Link>
                <Link href="/terms" className="block hover:text-[#8A2BE2] transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block hover:text-[#8A2BE2] transition-colors">Privacy Policy</Link>
                <div className="pt-2 text-zinc-800 text-[9px] font-black tracking-normal uppercase">Encrypted · Zero disk writes</div>
            </div>
        </aside>
    );
}
