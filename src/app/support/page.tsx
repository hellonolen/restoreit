// AGENT 7 — Support Page: tooltips, relay explanation, troubleshooting, system requirements, FAQ
import { HelpCircle, Terminal, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = { title: 'Help & Support — restoreit', description: 'Troubleshooting guide, system requirements, and answers to common questions about restoreit secure file restore.' };

const faqs = [
    { q: 'What does the curl relay command actually do?', a: "The curl command fetches a tiny relay script from our secure server and runs it directly in your computer's memory (RAM). It never saves anything to your disk. It reads your drive's raw sectors and sends them through an encrypted HTTPS connection to our Cloud engine for restoration. Nothing is written to the disk you are restoring from." },
    { q: 'Why not just download restoration software?', a: 'Any file you download and install onto an affected disk can overwrite the exact sectors containing your deleted files. The memory-only relay approach is the only method that avoids destructive overwriting — which is why traditional restoration tools often fail.' },
    { q: "What if the relay command times out?", a: 'The relay automatically reconnects if the connection is interrupted. If it times out completely, simply re-run the same curl command. Your scan progress is checkpointed in our Cloud — you will not start over from scratch.' },
    { q: 'What file systems are supported?', a: 'restoreit supports APFS and HFS+ (macOS), NTFS and exFAT (Windows), and ext4 (Linux). RAID configurations and standard encrypted volumes (FileVault, BitLocker) require the Pro tier with extended scanning protocols.' },
    { q: 'Can I restore files from a formatted drive?', a: 'Yes. Formatting a drive deletes the file table but usually does not zero out the data sectors. restoreit\'s Deep Scan reads every sector and restores files from raw binary patterns, independent of the file table.' },
    { q: 'What if no files are found?', a: 'You are not charged. Our pricing model gates payment behind confirmed file detection ("Proof of Life"). If the scan returns zero restorable files, the session closes at no cost.' },
    { q: 'How long does my data stay in the restoreit cloud?', a: 'Standard tier: your restored files must be downloaded immediately — no persistent cloud storage. Pro tier: your data is retained in encrypted RestoreIt Cloud for 7 days, after which it is automatically purged. Protection Plan subscribers receive extended 30-day retention.' },
    { q: 'Is my data private? Can restoreit see my files?', a: 'All data is encrypted in transit using TLS and encrypted at rest using AES-256. restoreit operates on a zero-access principle — our infrastructure processes raw binary streams. We do not index, catalog, or access the content of your files beyond what is necessary for restoration.' },
    { q: 'What are the system requirements?', a: 'macOS 12+ (Monterey or later), Windows 10+ (64-bit), or Ubuntu 20.04+. For large drives (2TB+) we recommend 8GB RAM minimum. ARM (Apple Silicon M1/M2/M3) and Intel x86_64 are both natively supported. Internet connection required.' },
];

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans flex flex-col">
            <SiteHeader />

            <main className="flex-1 pt-28 max-w-3xl mx-auto px-6 py-16 space-y-16 w-full">

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <HelpCircle className="text-[#8A2BE2]" size={24} />
                        <h1 className="text-3xl font-semibold text-white">Help & Support</h1>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">Everything you need to understand how restoreit works and resolve common issues.</p>
                </div>

                {/* System Requirements */}
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4">System Requirements</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { os: 'macOS', req: 'Monterey 12.0+', note: 'APFS, HFS+ · Apple Silicon & Intel' },
                            { os: 'Windows', req: '10 or 11 (64-bit)', note: 'NTFS, exFAT, FAT32' },
                            { os: 'Linux', req: 'Ubuntu 20.04+', note: 'ext4, exFAT · x86_64' },
                        ].map(({ os, req, note }) => (
                            <div key={os} className="p-4 rounded-xl border border-white/8 bg-black/30">
                                <div className="text-white font-semibold text-sm mb-1">{os}</div>
                                <div className="text-[#8A2BE2] text-xs font-mono mb-1">{req}</div>
                                <div className="text-zinc-600 text-[11px]">{note}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-xs text-zinc-600 flex items-center gap-2">
                        <Terminal size={12} className="text-zinc-500" />
                        Minimum 4 GB RAM. 8 GB+ recommended for drives larger than 2 TB. Internet connection required for relay streaming.
                    </div>
                </section>

                {/* Relay Explainer */}
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                        <Terminal size={20} className="text-[#8A2BE2]" />
                        What Is the Secure Relay?
                    </h2>
                    <div className="p-6 rounded-xl border border-white/10 bg-black/30 space-y-4 text-sm text-zinc-400 leading-relaxed">
                        <p>The restoreit relay is a lightweight script that runs entirely in your computer&apos;s RAM. It never touches your disk with any writes — it only reads raw sector data and streams it over an encrypted connection to our Cloud restoration engine.</p>
                        <p>This design is intentional. Traditional restoration software requires installation, which writes files to the very disk you are trying to restore — permanently destroying the sectors holding your deleted data. The relay eliminates this risk completely.</p>
                        <div className="font-mono text-xs bg-black border border-white/10 rounded-xl p-4 text-[#8A2BE2] flex items-center gap-3">
                            <Terminal size={14} />
                            curl -sL https://restoreit.app/relay | bash
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { icon: <Shield size={14} />, label: 'Zero disk writes' },
                                { icon: <Shield size={14} />, label: 'Memory only execution' },
                                { icon: <Shield size={14} />, label: 'TLS encrypted stream' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#8A2BE2]">
                                    {icon}<span className="text-zinc-400">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                        <AlertTriangle size={20} className="text-[#8A2BE2]" />
                        Troubleshooting
                    </h2>
                    <div className="space-y-3">
                        {[
                            { problem: 'Relay command not found', fix: 'Ensure curl is installed. On macOS it ships by default. On Linux: sudo apt install curl. On Windows, use Git Bash or WSL.' },
                            { problem: 'Permission denied when running relay', fix: 'You may need to grant Terminal full disk access. Go to System Settings → Privacy & Security → Full Disk Access → enable Terminal.' },
                            { problem: 'Drive not appearing in the selector', fix: 'Check that the drive is mounted. Open Disk Utility and verify the drive appears and is mounted. Reconnect USB drives before launching the relay.' },
                            { problem: 'Upload speed very slow', fix: 'restoreit adapts to your bandwidth. A slow connection will simply increase scan time but will not fail the restoration. For fastest results use a wired Ethernet connection.' },
                            { problem: 'Scan disconnected mid-way', fix: 'Re-run the same curl command. Scan state is checkpointed. The relay will resume from the last confirmed sector rather than restarting from zero.' },
                            { problem: 'Files show as corrupted', fix: 'Partial corruption occurs when sectors have been partially overwritten since deletion. These files are marked with a restore integrity score. Fragmented files (50%+ integrity) can often still be opened.' },
                        ].map(({ problem, fix }) => (
                            <details key={problem} className="group p-4 rounded-xl border border-white/8 bg-black/30 cursor-pointer">
                                <summary className="flex items-center justify-between text-sm font-medium text-zinc-300 list-none">
                                    {problem}
                                    <ChevronRight size={16} className="text-zinc-600 group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{fix}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map(({ q, a }) => (
                            <details key={q} className="group p-5 rounded-xl border border-white/8 bg-black/20 cursor-pointer">
                                <summary className="flex items-center justify-between text-sm font-medium text-zinc-200 list-none pr-2">
                                    {q}
                                    <ChevronRight size={16} className="text-zinc-600 shrink-0 group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <div className="text-center text-xs text-zinc-700 pb-8">
                    Still stuck? Email us at <a href="mailto:support@restoreit.app" className="text-[#8A2BE2] hover:underline">support@restoreit.app</a>. Pro subscribers receive priority response within 4 hours.
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
