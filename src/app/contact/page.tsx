"use client";

import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Send, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;
        setSending(true);
        setError('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = (await res.json()) as { success: boolean; error?: string };
            if (data.success) {
                setSent(true);
            } else {
                setError(data.error ?? 'Failed to send. Please try again.');
            }
        } catch {
            setError('Network error. Please email support@restoreit.app directly.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <div className="max-w-2xl mx-auto px-6 md:px-8 space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter">Contact Us</h1>
                        <p className="text-lg text-[var(--color-text-secondary)]">
                            Have a question, need help, or want to reach the team? Fill out the form below.
                        </p>
                    </div>

                    {sent ? (
                        <div className="p-10 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto">
                                <MessageSquare size={28} className="text-[var(--color-accent)]" />
                            </div>
                            <h2 className="text-2xl font-black">Message Sent</h2>
                            <p className="text-[var(--color-text-secondary)]">We&apos;ll get back to you as soon as possible.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                                        className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-5 py-4 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                                        className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-5 py-4 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Subject</label>
                                <select value={subject} onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-5 py-4 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]/50 transition-all appearance-none">
                                    <option value="" className="bg-[var(--color-background-elevated)]">Select a topic</option>
                                    <option value="recovery" className="bg-[var(--color-background-elevated)]">Restoration Help</option>
                                    <option value="billing" className="bg-[var(--color-background-elevated)]">Billing Question</option>
                                    <option value="technical" className="bg-[var(--color-background-elevated)]">Technical Issue</option>
                                    <option value="partnership" className="bg-[var(--color-background-elevated)]">Partnership</option>
                                    <option value="other" className="bg-[var(--color-background-elevated)]">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} placeholder="Describe your question or issue..."
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-5 py-4 text-sm text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] outline-none focus:border-[var(--color-accent)]/50 transition-all resize-none" />
                            </div>

                            <button type="submit" disabled={sending}
                                className={`w-full h-14 rounded-xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${
                                    sending
                                        ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed'
                                        : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}>
                                {sending ? (
                                    <><div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-foreground)] rounded-full animate-spin" /> Sending...</>
                                ) : (
                                    <>Send Message <Send size={16} /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="flex items-center gap-3 text-sm text-[var(--color-text-dim)]">
                        <Mail size={16} />
                        <span>Or email us directly at <a href="mailto:support@restoreit.app" className="text-[var(--color-accent)] hover:underline">support@restoreit.app</a></span>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
