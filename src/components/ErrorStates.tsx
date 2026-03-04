"use client";

import { AlertTriangle, WifiOff, HardDrive, Lock, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
    type: '404' | '500' | 'connection' | 'drive' | 'auth';
    onRetry?: () => void;
}

export default function ErrorStates({ type, onRetry }: ErrorStateProps) {
    const configs = {
        '404': {
            icon: <AlertTriangle size={48} className="text-[var(--color-accent)]" />,
            title: "Sector Not Found",
            desc: "The resource you are looking for has been moved or purged from our forensic cache. Error Code: 0x404NF",
            action: (
                <Link href="/" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    <ArrowLeft size={18} /> Return to Terminal
                </Link>
            )
        },
        '500': {
            icon: <ShieldAlert size={48} className="text-red-400" />,
            title: "Agent Breakdown",
            desc: "Our Cloud Forensics Agents encountered an unhandled sector fault. We have been notified and are rerouting resources. Error Code: 0x500AF",
            action: (
                <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    <RefreshCw size={18} /> Restart Forensics
                </button>
            )
        },
        'connection': {
            icon: <WifiOff size={48} className="text-yellow-400" />,
            title: "Relay Pipe Broken",
            desc: "The secure AES-256 encrypted relay pipe between your machine and our cloud has been interrupted.",
            action: (
                <button onClick={onRetry} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    <RefreshCw size={18} /> Re-establish Link
                </button>
            )
        },
        'drive': {
            icon: <HardDrive size={48} className="text-red-400" />,
            title: "Volume Disconnected",
            desc: "The source volume 'Macintosh HD' is no longer readable. Please check your physical connection.",
            action: (
                <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    <RefreshCw size={18} /> Re-scan Hardware
                </button>
            )
        },
        'auth': {
            icon: <Lock size={48} className="text-[var(--color-accent)]" />,
            title: "Access Key Invalid",
            desc: "Your forensic session token has expired or the auth-key provided does not match the file system journal.",
            action: (
                <Link href="/login" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    Re-authenticate Session
                </Link>
            )
        }
    };

    const config = configs[type];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[var(--color-background)] text-[var(--color-text-secondary)]">

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-[32px] bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center mx-auto shadow-2xl">
                    {config.icon}
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-[var(--color-foreground)] tracking-tight uppercase">
                        {config.title}
                    </h1>
                    <p className="text-lg leading-relaxed text-[var(--color-text-tertiary)]">
                        {config.desc}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-6">
                    {config.action}
                    <Link href="/support" className="text-xs font-bold text-[var(--color-text-dim)] hover:text-[var(--color-foreground)] uppercase tracking-widest transition-colors">
                        Contact Forensic Support
                    </Link>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--color-accent) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
    );
}
