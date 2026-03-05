import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'What To Do When You Accidentally Format a Drive',
    description: 'You formatted the wrong drive. Your files look gone. They\'re probably not. A step-by-step guide for the first 60 seconds and beyond.',
    openGraph: {
        title: 'What To Do When You Accidentally Format a Drive — restoreit',
        description: 'Your files aren\'t gone yet. Here\'s exactly what to do to maximize your chances of recovery.',
    },
};

const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What To Do When You Accidentally Format a Drive',
    datePublished: '2026-03-03',
    author: { '@type': 'Organization', name: 'restoreit' },
    publisher: { '@type': 'Organization', name: 'restoreit', url: 'https://restoreit.app' },
    description: 'What to do immediately after formatting a drive — and how to recover the files.',
};

export default function FormattedDrivePage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <article className="px-5 sm:px-6 md:px-8">
                    <div className="max-w-3xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[var(--color-text-dim)] text-xs font-bold uppercase tracking-[0.15em] hover:text-[var(--color-foreground)] transition-colors mb-8">
                            <ArrowLeft size={12} /> Back to Blog
                        </Link>

                        <div className="mb-10 space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-dim)]">
                                <time>March 3, 2026</time>
                                <span>·</span>
                                <span>4 min read</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                                What To Do When You Accidentally Format a Drive
                            </h1>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
                            <p className="text-lg font-medium text-[var(--color-foreground)]">
                                You selected the wrong volume. Clicked &quot;Erase.&quot; Watched the progress bar complete. Your stomach drops. Everything&apos;s gone. Or is it?
                            </p>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">What formatting actually does</h2>
                            <p>
                                Formatting a drive — whether quick format or &quot;erase&quot; in Disk Utility — does not zero out your data. It creates a new, empty file system table on top of the existing one. Think of it like tearing out the table of contents in a book: the pages are still there, but the index that tells the operating system where to find them is gone.
                            </p>
                            <p>
                                <strong className="text-[var(--color-foreground)]">Your data is still physically on the drive.</strong> It sits there, intact, until new files are written over those sectors. This is why the next 60 seconds matter more than anything else.
                            </p>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">The first 60 seconds</h2>
                            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
                                <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">Critical — Do this now</div>
                                <ol className="space-y-2 list-decimal pl-5 text-[var(--color-foreground)]">
                                    <li><strong>Stop writing to the drive.</strong> Do not save files. Do not install anything. Do not copy new data onto it.</li>
                                    <li><strong>If it&apos;s an external drive,</strong> disconnect it gently but immediately.</li>
                                    <li><strong>If it&apos;s your system drive,</strong> don&apos;t shut down your computer — just stop all file operations. Shutting down can trigger write operations.</li>
                                    <li><strong>Do not run Disk Utility, CHKDSK, or any repair tool.</strong> These tools write repair data to the drive.</li>
                                </ol>
                            </div>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">Quick format vs. full format</h2>
                            <p>
                                <strong className="text-[var(--color-foreground)]">Quick format</strong> (the default on both macOS and Windows) only rewrites the file system metadata — the &quot;table of contents.&quot; Your actual file data remains untouched. Recovery success rates from a quick format are typically very high, often 90%+ if you act quickly.
                            </p>
                            <p>
                                <strong className="text-[var(--color-foreground)]">Full format</strong> (also called &quot;secure erase&quot;) writes zeroes across the entire drive surface. If you ran a full format, the data is likely gone. However, on modern SSDs with wear-leveling, even a &quot;full format&quot; doesn&apos;t always overwrite every cell — some data may still be recoverable.
                            </p>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">How to recover</h2>
                            <p>
                                The safest recovery method reads the drive&apos;s raw sectors without writing anything back to it. Cloud-based restoration is ideal here because all processing happens remotely:
                            </p>
                            <ol className="space-y-4 list-none pl-0">
                                <li className="flex gap-4">
                                    <span className="text-[var(--color-accent)] font-black text-lg shrink-0">01</span>
                                    <div><strong className="text-[var(--color-foreground)]">Run a memory-only relay.</strong> A one-line command that reads your drive from RAM — no installation, no writes to disk.</div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-[var(--color-accent)] font-black text-lg shrink-0">02</span>
                                    <div><strong className="text-[var(--color-foreground)]">Stream to cloud analysis.</strong> Your drive sectors are sent over an encrypted connection to a forensic scan engine that reconstructs files from raw binary data — independent of the file table that was erased.</div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-[var(--color-accent)] font-black text-lg shrink-0">03</span>
                                    <div><strong className="text-[var(--color-foreground)]">Preview and download.</strong> See exactly what files were found before paying. Download your recovered files to a different, safe drive.</div>
                                </li>
                            </ol>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">Recovery chances by scenario</h2>
                            <div className="overflow-x-auto -mx-5 sm:mx-0">
                                <table className="w-full text-sm border-collapse min-w-[400px]">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)]">Scenario</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)]">Recovery chance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[var(--color-text-tertiary)]">
                                        <tr className="border-b border-[var(--color-border-subtle)]">
                                            <td className="py-3 px-4 text-[var(--color-foreground)]">Quick format, no new data written</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">Very high (90%+)</td>
                                        </tr>
                                        <tr className="border-b border-[var(--color-border-subtle)]">
                                            <td className="py-3 px-4 text-[var(--color-foreground)]">Quick format, some new files written</td>
                                            <td className="py-3 px-4 text-yellow-400 font-bold">Moderate to high</td>
                                        </tr>
                                        <tr className="border-b border-[var(--color-border-subtle)]">
                                            <td className="py-3 px-4 text-[var(--color-foreground)]">Quick format, heavily used since</td>
                                            <td className="py-3 px-4 text-orange-400 font-bold">Low to moderate</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-[var(--color-foreground)]">Full/secure erase (HDD)</td>
                                            <td className="py-3 px-4 text-red-400 font-bold">Very low</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h2 className="text-2xl font-black text-[var(--color-foreground)] tracking-tight pt-4">Key takeaway</h2>
                            <p>
                                A formatted drive is not an empty drive. If you act fast and avoid writing new data, your files are likely still recoverable. The safest approach is one that reads without writing — cloud-based, memory-only recovery.
                            </p>

                            <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
                                <div className="text-[var(--color-foreground)] font-black text-lg mb-2">Formatted a drive by accident?</div>
                                <p className="text-sm mb-4 text-[var(--color-text-tertiary)]">restoreit reads your drive without writing a single byte. Preview recovered files before you pay.</p>
                                <Link href="/restore" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-[0.15em] hover:opacity-90 transition-all">
                                    Start Recovery <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <SiteFooter />
        </div>
    );
}
