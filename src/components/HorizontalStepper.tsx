"use client";
import { Check } from 'lucide-react';
import { StepType } from '../types';

interface HorizontalStepperProps {
    currentStep: StepType;
    darkMode: boolean;
}

const steps = [
    { id: 1 as StepType, label: 'Diagnostic' },
    { id: 2 as StepType, label: 'Target' },
    { id: 3 as StepType, label: 'Scanning' },
    { id: 4 as StepType, label: 'Finalizing' },
    { id: 5 as StepType, label: 'Extraction' },
];

export default function HorizontalStepper({ currentStep, darkMode }: HorizontalStepperProps) {
    return (
        <div className="w-full py-8 mb-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => {
                    const done = currentStep > step.id;
                    const active = currentStep === step.id;
                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative group">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done
                                        ? 'bg-[#8A2BE2] border-[#8A2BE2] text-white'
                                        : active
                                            ? 'border-[#8A2BE2] bg-white text-[#8A2BE2] shadow-[0_0_15px_rgba(138,43,226,0.3)]'
                                            : darkMode ? 'border-zinc-800 bg-[#0A0A0B] text-zinc-700' : 'border-zinc-200 bg-white text-zinc-300'
                                    }`}>
                                    {done ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-black">{step.id}</span>}
                                </div>
                                <span className={`absolute -bottom-6 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${active ? '#8A2BE2' : done ? 'text-zinc-500' : 'text-zinc-700'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-0.5 relative">
                                    <div className={`absolute inset-0 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                                    <div
                                        className="absolute inset-0 bg-[#8A2BE2] transition-all duration-1000 ease-in-out origin-left"
                                        style={{ transform: `scaleX(${done ? 1 : 0})` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
