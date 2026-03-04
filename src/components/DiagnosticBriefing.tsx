"use client";

import { useState } from 'react';
import { FileText, Image as ImageIcon, Film, Archive, Shield, ArrowRight, Lightbulb } from 'lucide-react';
import { FileCategory } from '../types';

interface DiagnosticBriefingProps {
    onComplete: (data: { scenario: string; priorities: FileCategory[] }) => void;
    darkMode: boolean;
}

const PRIORITIES: { id: FileCategory; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'images', label: 'Photos & Images', icon: <ImageIcon size={18} />, description: 'JPEG, RAW, PNG, HEIC' },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} />, description: 'PDF, DOCX, XLSX, TXT' },
    { id: 'videos', label: 'Videos', icon: <Film size={18} />, description: 'MP4, MOV, AVI, MKV' },
    { id: 'archives', label: 'Archives', icon: <Archive size={18} />, description: 'ZIP, RAR, 7Z, TAR' },
    { id: 'system', label: 'System Files', icon: <Shield size={18} />, description: 'Logs, DBs, Configs' },
];

export default function DiagnosticBriefing({ onComplete, darkMode }: DiagnosticBriefingProps) {
    const [scenario, setScenario] = useState('');
    const [selectedPriorities, setSelectedPriorities] = useState<FileCategory[]>([]);

    const togglePriority = (id: FileCategory) => {
        setSelectedPriorities(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleProceed = () => {
        if (!scenario.trim()) return;
        onComplete({ scenario, priorities: selectedPriorities });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div>
                <div className="text-[#8A2BE2] text-xs font-black tracking-widest uppercase mb-3">Tell Us What Happened</div>
                <h1 className={`text-4xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                    What happened to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#B066FF]">files?</span>
                </h1>
                <p className={`text-lg leading-relaxed max-w-2xl ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Describing your situation helps us scan smarter and find your files faster.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12">
                {/* Main Intake */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                        <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>What Happened</label>
                        <div className={`relative group transition-all duration-300 ${darkMode ? 'focus-within:ring-1 focus-within:ring-[#8A2BE2]/50' : 'focus-within:ring-1 focus-within:ring-[#8A2BE2]/30'} rounded-3xl`}>
                            <textarea
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                                placeholder="Example: 'Deleted a folder of wedding photos from June 2025 by mistake...' or 'Formatted an SD card containing research documents...'"
                                className={`w-full h-48 p-6 rounded-3xl resize-none outline-none transition-all ${darkMode
                                    ? 'bg-black/40 border-white/5 text-white placeholder-zinc-800'
                                    : 'bg-white border-black/5 text-zinc-900 placeholder-zinc-300'
                                    } border-[1.5px] focus:border-[#8A2BE2]/50`}
                            />
                            <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
                                <Lightbulb size={12} className="text-[#8A2BE2]" />
                                Be as specific as possible
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-6 rounded-3xl bg-[#8A2BE2]/5 border border-[#8A2BE2]/10">
                        <div className="w-12 h-12 rounded-2xl bg-[#8A2BE2]/10 flex items-center justify-center text-[#8A2BE2] shrink-0">
                            <Shield size={24} />
                        </div>
                        <div className="space-y-1">
                            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Your Privacy Is Protected</div>
                            <div className="text-xs text-zinc-500 leading-relaxed">Your description is only used to guide the scan. No data is stored or shared.</div>
                        </div>
                    </div>
                </div>

                {/* Priorities */}
                <div className="lg:col-span-2 space-y-6">
                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>What Are You Looking For?</label>
                    <div className="space-y-3">
                        {PRIORITIES.map((p) => {
                            const isSelected = selectedPriorities.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => togglePriority(p.id)}
                                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all group ${isSelected
                                        ? 'border-[#8A2BE2] bg-[#8A2BE2]/10'
                                        : darkMode ? 'border-white/5 bg-white/[0.02] hover:border-white/10' : 'border-black/5 bg-zinc-50 hover:border-black/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-[#8A2BE2] text-white' : darkMode ? 'bg-black/40 text-zinc-600 group-hover:text-zinc-400' : 'bg-white text-zinc-400 group-hover:text-zinc-500'
                                        }`}>
                                        {p.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${isSelected ? 'text-white' : darkMode ? 'text-zinc-400' : 'text-zinc-900'}`}>{p.label}</div>
                                        <div className={`text-[10px] ${isSelected ? 'text-[#8A2BE2]/80' : 'text-zinc-600'}`}>{p.description}</div>
                                    </div>
                                    {isSelected && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-[#8A2BE2] animate-pulse shadow-[0_0_10px_#8A2BE2]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="flex justify-end pt-8 border-t border-white/5">
                <button
                    onClick={handleProceed}
                    disabled={!scenario.trim()}
                    className={`group flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl ${scenario.trim()
                        ? 'bg-[#8A2BE2] hover:bg-[#7e22ce] text-white shadow-[#8A2BE2]/20 hover:shadow-[#8A2BE2]/30 active:scale-[0.98]'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed grayscale'
                        }`}
                >
                    Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
