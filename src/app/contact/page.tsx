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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;
        setSending(true);

        // TODO: Wire to API route
        await new Promise(r => setTimeout(r, 1500));

        setSent(true);
        setSending(false);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <div className="max-w-2xl mx-auto px-6 md:px-8 space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Contact Us</h1>
                        <p className="text-lg text-zinc-400">
                            Have a question, need help, or want to reach the team? Fill out the form below.
                        </p>
                    </div>

                    {sent ? (
                        <div className="p-10 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto">
                                <MessageSquare size={28} className="text-[var(--color-accent)]" />
                            </div>
                            <h2 className="text-2xl font-black">Message Sent</h2>
                            <p className="text-zinc-400">We&apos;ll get back to you as soon as possible.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        placeholder="Your name"
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-4 text-sm text-white placeholder-zinc-700 outline-none focus:border-[var(--color-accent)]/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-4 text-sm text-white placeholder-zinc-700 outline-none focus:border-[var(--color-accent)]/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-[var(--color-accent)]/50 transition-all appearance-none"
                                >
                                    <option value="" className="bg-black">Select a topic</option>
                                    <option value="recovery" className="bg-black">Restoration Help</option>
                                    <option value="billing" className="bg-black">Billing Question</option>
                                    <option value="technical" className="bg-black">Technical Issue</option>
                                    <option value="partnership" className="bg-black">Partnership</option>
                                    <option value="other" className="bg-black">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={6}
                                    placeholder="Describe your question or issue..."
                                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-4 text-sm text-white placeholder-zinc-700 outline-none focus:border-[var(--color-accent)]/50 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full h-14 rounded-xl text-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${
                                    sending
                                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                        : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-[0_20px_40px_rgba(138,43,226,0.25)]'
                                }`}
                            >
                                {sending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>Send Message <Send size={16} /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Mail size={16} />
                        <span>Or email us directly at <a href="mailto:support@restoreit.app" className="text-[var(--color-accent)] hover:underline">support@restoreit.app</a></span>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
