import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'FAQ — restoreit',
    description: 'Frequently asked questions about restoreit cloud file restoration.',
};

const faqCategories = [
    {
        category: 'General',
        questions: [
            { q: 'What is restoreit?', a: 'restoreit is a cloud-based file restoration platform. Instead of installing software on your drive (which risks overwriting deleted data), restoreit uses a memory-only relay to stream your drive\'s sectors to our cloud engine for analysis.' },
            { q: 'How is this different from other restoration tools?', a: 'Traditional restoration tools must be installed on your computer — writing new data to the same drive you\'re trying to restore. restoreit\'s relay runs entirely in RAM. Nothing is ever written to your disk.' },
            { q: 'What file systems are supported?', a: 'APFS and HFS+ (macOS), NTFS and exFAT (Windows), ext4 (Linux). RAID configurations and encrypted volumes (FileVault, BitLocker) are supported with restoreit Pro.' },
            { q: 'Can I restore files from a formatted drive?', a: 'Formatting a drive deletes the file table but does not necessarily zero out the data sectors. restoreit Pro\'s deep scan reads every sector and attempts to reconstruct files from raw binary patterns, independent of the file table.' },
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
            { q: 'What products does restoreit offer?', a: 'Four products: restoreit Scan (one-time per device) for immediate restoration, restoreit Pro (one-time per device) for deep scan and priority restoration, restoreit Cloud (yearly) for 500GB encrypted storage, and restoreit Protection (monthly) for ongoing disk monitoring. See our pricing page for current rates.' },
            { q: 'Are these prices per device?', a: 'Yes. restoreit Scan and restoreit Pro are priced per device. You can add additional devices at any time.' },
            { q: 'What\'s the difference between Scan and Pro?', a: 'Scan provides a standard restoration scan with immediate download. Pro adds deep sector-level scanning, damaged file reconstruction, priority restore queue, and a 7-day download window.' },
            { q: 'Who can purchase restoreit Cloud?', a: 'restoreit Cloud is available to restoreit Pro customers. It provides 500GB of encrypted cloud storage for your restored files with long-term access.' },
            { q: 'Can I add products later?', a: 'Yes. You can upgrade or add any product at any time — Scan to Pro, add Cloud storage, or subscribe to Protection after your restoration.' },
            { q: 'Do you offer refunds?', a: 'All completed purchases are final. You review scan results before paying, so you know exactly what you\'re getting.' },
        ],
    },
    {
        category: 'Security & Privacy',
        questions: [
            { q: 'Is my data private?', a: 'All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256. restoreit operates on a zero-access principle — our infrastructure processes raw binary streams. We do not index, catalog, or access the content of your files beyond what is necessary for restoration.' },
            { q: 'How long does my data stay in restoreit Cloud?', a: 'restoreit Scan: download immediately, no persistent storage. restoreit Pro: 7-day download window. restoreit Cloud subscribers: files stored for as long as your subscription is active, up to 500GB.' },
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
    {
        category: 'What restoreit Is Ideal For',
        questions: [
            { q: 'What types of data loss does restoreit handle?', a: 'restoreit is built for logical data loss — accidental deletion, drive formatting, file system corruption, ransomware encryption, and partition loss. These are the most common causes of data loss, accounting for roughly 70-80% of all recovery cases.' },
            { q: 'Why is cloud-based recovery better for these cases?', a: 'Traditional recovery requires shipping your drive to a lab and waiting days. restoreit streams your drive data to our cloud engine in minutes — no shipping, no physical lab, no specialized equipment. Cloud-based recovery is faster, cheaper, and infinitely more scalable than physical lab recovery for logical failures.' },
            { q: 'What about physical drive damage?', a: 'If your drive has physical hardware failure — seized motor, crashed read/write heads, or fire/water damage — the drive cannot be read at the sector level. These cases require a physical cleanroom lab. restoreit is not designed for hardware-level recovery.' },
            { q: 'Can restoreit recover files from a ransomware attack?', a: "Yes. Ransomware typically encrypts files in place, but the original unencrypted data often remains on disk until overwritten. restoreit's deep scan reads raw sectors beneath the encrypted layer to locate and reconstruct the original files." },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <section className="max-w-3xl mx-auto px-6 md:px-8 space-y-16">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-[var(--color-text-secondary)]">
                            Everything you need to know about restoreit.
                        </p>
                    </div>

                    {faqCategories.map((cat) => (
                        <div key={cat.category} className="space-y-4">
                            <h2 className="text-sm font-black text-[var(--color-accent)] uppercase tracking-[0.2em]">{cat.category}</h2>
                            <div className="space-y-3">
                                {cat.questions.map(({ q, a }) => (
                                    <details key={q} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                            <span className="text-sm font-bold pr-4">{q}</span>
                                            <ChevronRight size={16} className="text-[var(--color-text-dim)] shrink-0 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-5 pb-5">
                                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{a}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="text-center space-y-4 pt-8">
                        <p className="text-[var(--color-text-tertiary)]">Still have questions?</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/contact" className="text-sm font-bold text-[var(--color-accent)] flex items-center gap-2 hover:opacity-80 transition-all">
                                Contact Us <ArrowRight size={14} />
                            </Link>
                            <Link href="/support" className="text-sm font-bold text-[var(--color-text-tertiary)] flex items-center gap-2 hover:text-[var(--color-foreground)] transition-all">
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
