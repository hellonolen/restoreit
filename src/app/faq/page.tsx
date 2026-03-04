import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'FAQ — RestoreIt',
    description: 'Frequently asked questions about RestoreIt cloud file restoration.',
};

const faqCategories = [
    {
        category: 'General',
        questions: [
            { q: 'What is RestoreIt?', a: 'RestoreIt is a cloud-based file restoration platform. Instead of installing software on your drive (which risks overwriting deleted data), RestoreIt uses a memory-only relay to stream your drive\'s sectors to our cloud engine for analysis.' },
            { q: 'How is this different from other restoration tools?', a: 'Traditional restoration tools must be installed on your computer — writing new data to the same drive you\'re trying to restore. RestoreIt\'s relay runs entirely in RAM. Nothing is ever written to your disk.' },
            { q: 'What file systems are supported?', a: 'APFS and HFS+ (macOS), NTFS and exFAT (Windows), ext4 (Linux). RAID configurations and encrypted volumes (FileVault, BitLocker) are supported with RestoreIt Pro.' },
            { q: 'Can I restore files from a formatted drive?', a: 'Formatting a drive deletes the file table but does not necessarily zero out the data sectors. RestoreIt Pro\'s deep scan reads every sector and attempts to reconstruct files from raw binary patterns, independent of the file table.' },
        ],
    },
    {
        category: 'The Relay',
        questions: [
            { q: 'What does the curl relay command do?', a: 'The curl command fetches a lightweight relay script from our secure server and runs it directly in your computer\'s memory (RAM). It never saves anything to your disk. It reads your drive\'s raw sectors and sends them through an encrypted HTTPS connection to our cloud engine.' },
            { q: 'Why not just download restoration software?', a: 'Any file you download and install onto an affected disk can overwrite the exact sectors containing your deleted files. The memory-only relay approach avoids this risk entirely.' },
            { q: 'What if the relay command times out?', a: 'The relay automatically reconnects if the connection is interrupted. If it times out completely, re-run the same curl command. Your scan progress is checkpointed — you will not start from scratch.' },
        ],
    },
    {
        category: 'Products & Pricing',
        questions: [
            { q: 'What products does RestoreIt offer?', a: 'Four products: RestoreIt Scan ($89, one-time per device) for immediate restoration, RestoreIt Pro ($249, one-time per device) for deep scan and priority restoration, RestoreIt Cloud ($79/year) for 500GB encrypted storage, and RestoreIt Protection ($12/month) for ongoing disk monitoring.' },
            { q: 'Are these prices per device?', a: 'Yes. RestoreIt Scan and RestoreIt Pro are priced per device. You can add additional devices at any time.' },
            { q: 'What\'s the difference between Scan and Pro?', a: 'Scan provides a standard restoration scan with immediate download. Pro adds deep sector-level scanning, damaged file reconstruction, priority restore queue, and a 7-day download window.' },
            { q: 'Who can purchase RestoreIt Cloud?', a: 'RestoreIt Cloud is available to RestoreIt Pro customers. It provides 500GB of encrypted cloud storage for your restored files with long-term access.' },
            { q: 'Can I add products later?', a: 'Yes. You can upgrade or add any product at any time — Scan to Pro, add Cloud storage, or subscribe to Protection after your restoration.' },
            { q: 'Do you offer refunds?', a: 'All completed purchases are final. You review scan results before paying, so you know exactly what you\'re getting.' },
        ],
    },
    {
        category: 'Security & Privacy',
        questions: [
            { q: 'Is my data private?', a: 'All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256. RestoreIt operates on a zero-access principle — our infrastructure processes raw binary streams. We do not index, catalog, or access the content of your files beyond what is necessary for restoration.' },
            { q: 'How long does my data stay in RestoreIt Cloud?', a: 'RestoreIt Scan: download immediately, no persistent storage. RestoreIt Pro: 7-day download window. RestoreIt Cloud subscribers: files stored for as long as your subscription is active, up to 500GB.' },
        ],
    },
    {
        category: 'Troubleshooting',
        questions: [
            { q: 'Relay command not found', a: 'Ensure curl is installed. On macOS it ships by default. On Linux: sudo apt install curl. On Windows, use Git Bash or WSL.' },
            { q: 'Permission denied when running relay', a: 'You may need to grant Terminal full disk access. Go to System Settings → Privacy & Security → Full Disk Access → enable Terminal.' },
            { q: 'Drive not appearing in the selector', a: 'Check that the drive is mounted. Open Disk Utility and verify the drive appears and is mounted. Reconnect USB drives before launching the relay.' },
            { q: 'Scan disconnected mid-way', a: 'Re-run the same curl command. Scan state is checkpointed. The relay will resume from the last confirmed sector.' },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <section className="max-w-3xl mx-auto px-6 md:px-8 space-y-16">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-zinc-400">
                            Everything you need to know about RestoreIt.
                        </p>
                    </div>

                    {faqCategories.map((cat) => (
                        <div key={cat.category} className="space-y-4">
                            <h2 className="text-sm font-black text-[var(--color-accent)] uppercase tracking-[0.2em]">{cat.category}</h2>
                            <div className="space-y-3">
                                {cat.questions.map(({ q, a }) => (
                                    <details key={q} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                            <span className="text-sm font-bold text-zinc-200 pr-4">{q}</span>
                                            <ChevronRight size={16} className="text-zinc-600 shrink-0 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-5 pb-5">
                                            <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="text-center space-y-4 pt-8">
                        <p className="text-zinc-500">Still have questions?</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/contact" className="text-sm font-bold text-[var(--color-accent)] flex items-center gap-2 hover:opacity-80 transition-all">
                                Contact Us <ArrowRight size={14} />
                            </Link>
                            <Link href="/support" className="text-sm font-bold text-zinc-500 flex items-center gap-2 hover:text-white transition-all">
                                Support Center <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
