// AGENT 1 — Keyboard Shortcuts Modal
"use client";
import { X } from 'lucide-react';
import { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

interface KeyboardShortcutsModalProps { isOpen: boolean; onClose: () => void; darkMode: boolean; }
const SHORTCUTS = [
    { keys: ['⌘', 'K'], action: 'Show keyboard shortcuts' },
    { keys: ['⌘', 'D'], action: 'Toggle dark / light mode' },
    { keys: ['⌘', 'H'], action: 'Open scan history' },
    { keys: ['Esc'], action: 'Close any modal / drawer' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose, darkMode }: KeyboardShortcutsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
            <div
                ref={modalRef}
                className={`relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-[#111113] border-white/10' : 'bg-white border-black/10'}`}
            >
                <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Keyboard Shortcuts</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded" aria-label="Close"><X size={16} /></button>
                </div>
                <div className="p-5 space-y-3">
                    {SHORTCUTS.map(({ keys, action }) => (
                        <div key={action} className="flex items-center justify-between">
                            <span className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{action}</span>
                            <div className="flex items-center gap-1">
                                {keys.map(k => (
                                    <kbd key={k} className={`px-2 py-0.5 rounded text-[11px] font-mono border ${darkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>{k}</kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
