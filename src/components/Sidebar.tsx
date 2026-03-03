// AGENT 1 — Sidebar: 3 recovery steps + clean labels (no "Protect" product confusion)
"use client";
import { CheckCircle2 } from 'lucide-react';
import { StepType } from '../types';
import Link from 'next/link';

interface SidebarProps { currentStep: StepType; darkMode: boolean; }

const steps = [
    { id: 1 as StepType, label: 'Connect', desc: 'Run relay & select volume' },
    { id: 2 as StepType, label: 'Scan', desc: 'Cloud sweep in progress' },
    { id: 3 as StepType, label: 'Recover', desc: 'Unlock & extract files' },
];

export default function Sidebar({ currentStep, darkMode }: SidebarProps) {
    const effectiveStep = currentStep === 4 ? 3 : currentStep;

    return (
        <aside className={`w-72 shrink-0 border-r py-12 px-8 flex flex-col ${darkMode ? 'border-[#ffffff08]' : 'border-black/5'}`} aria-label="Recovery steps">
            <div className="space-y-1 flex-1">
                {steps.map(step => {
                    const done = effectiveStep > step.id;
                    const active = effectiveStep === step.id;
                    return (
                        <div key={step.id} className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-all ${active ? darkMode ? 'bg-[#8A2BE2]/5' : 'bg-[#8A2BE2]/5' : ''}`}>
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${done ? 'bg-green-500/20 border-green-500/40 text-green-400' : active ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50 text-[#8A2BE2]' : darkMode ? 'bg-white/5 border-white/10 text-zinc-600' : 'bg-zinc-100 border-zinc-200 text-zinc-400'}`}>
                                {done ? <CheckCircle2 size={14} /> : (
                                    <span className={`text-xs font-bold ${active ? 'text-[#8A2BE2]' : darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.id}</span>
                                )}
                            </div>
                            <div>
                                <div className={`text-sm font-semibold ${active ? darkMode ? 'text-white' : 'text-zinc-900' : done ? 'text-green-400' : darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.label}</div>
                                <div className={`text-xs mt-0.5 ${active ? darkMode ? 'text-zinc-400' : 'text-zinc-500' : 'text-zinc-600'}`}>{step.desc}</div>
                            </div>
                        </div>
                    );
                })}

                {/* Products note — clear and simple */}
                <div className={`mt-6 p-4 rounded-xl border ${darkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-zinc-50'}`}>
                    <div className={`text-[10px] uppercase tracking-widest font-bold mb-3 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Recovery Options</div>
                    <div className="space-y-2 text-xs">
                        <div className={`flex justify-between ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            <span>RestoreIt</span>
                            <span className="font-mono text-zinc-500">$89</span>
                        </div>
                        <div className={`flex justify-between ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            <span>RestoreIt Pro</span>
                            <span className="font-mono text-zinc-500">$249</span>
                        </div>
                        <div className={`pt-2 border-t flex justify-between ${darkMode ? 'border-white/5 text-[#8A2BE2]' : 'border-black/5 text-[#8A2BE2]'}`}>
                            <span>Protection Plan</span>
                            <span className="font-mono">$12/mo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`pt-8 border-t ${darkMode ? 'border-white/5' : 'border-black/5'} space-y-2 text-[11px] ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                <Link href="/account" className="block hover:text-zinc-400 transition-colors">My Account</Link>
                <Link href="/support" className="block hover:text-zinc-400 transition-colors">Help & Support</Link>
                <Link href="/terms" className="block hover:text-zinc-400 transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block hover:text-zinc-400 transition-colors">Privacy Policy</Link>
                <div className="pt-2 text-zinc-700">TLS Encrypted · Zero Disk Writes</div>
            </div>
        </aside>
    );
}
