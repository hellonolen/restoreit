// AGENT 1 — Notifications Toast Component
"use client";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
    notifications: Notification[];
    darkMode: boolean;
}

export function Notifications({ notifications, darkMode }: NotificationsProps) {
    if (!notifications.length) return null;
    const icons = { success: <CheckCircle2 size={16} className="text-green-400" />, warning: <AlertTriangle size={16} className="text-yellow-400" />, error: <AlertCircle size={16} className="text-red-400" />, info: <Info size={16} className="text-blue-400" /> };
    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none" aria-live="polite" aria-atomic="false">
            {notifications.map(n => (
                <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm max-w-sm animate-in slide-in-from-right-4 duration-300 ${darkMode ? 'bg-[#111113] border-white/10 text-zinc-300' : 'bg-white border-black/10 text-zinc-700'}`} role="alert">
                    {icons[n.type]}
                    <span className="flex-1">{n.message}</span>
                </div>
            ))}
        </div>
    );
}
