"use client";
import { Check } from 'lucide-react';
import { StepType } from '../types';

interface HorizontalStepperProps {
    currentStep: StepType;
}

const steps = [
    { id: 1 as StepType, label: 'Diagnostic' },
    { id: 2 as StepType, label: 'Target' },
    { id: 3 as StepType, label: 'Scanning' },
    { id: 4 as StepType, label: 'Finalizing' },
    { id: 5 as StepType, label: 'Extraction' },
];

export default function HorizontalStepper({ currentStep }: HorizontalStepperProps) {
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
                                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                                        : active
                                            ? 'border-[var(--color-accent)] bg-white text-[var(--color-accent)] shadow-[0_0_15px_rgba(138,43,226,0.3)]'
                                            : 'border-[var(--color-disabled-bg)] bg-[var(--color-background)] text-[var(--color-disabled-text)]'
                                    }`}>
                                    {done ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-black">{step.id}</span>}
                                </div>
                                <span className={`absolute -bottom-6 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${active ? 'text-[var(--color-accent)]' : done ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-disabled-text)]'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-0.5 relative">
                                    <div className="absolute inset-0 bg-[var(--color-disabled-bg)]" />
                                    <div
                                        className="absolute inset-0 bg-[var(--color-accent)] transition-all duration-1000 ease-in-out origin-left"
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
