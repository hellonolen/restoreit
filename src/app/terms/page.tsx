import Link from 'next/link';
export const metadata = { title: 'Terms of Service — restoreit', description: 'Terms of Service for restoreit cloud file restore platform.' };
export default function TermsPage() {
    const sections = [
        { title: '1. Service Description', body: 'restoreit provides cloud-based file restore services. Users connect a memory-only relay to stream raw disk data for analysis and restore. restoreit does not install software to user devices.' },
        { title: '2. Payment & Pricing', body: 'All transactions are one-time purchases unless a restoreit Pro subscription is explicitly selected. Charges are applied only after restorable files have been detected and confirmed ("Proof of Life"). Subscriptions bill monthly and may be cancelled at any time with immediate effect.' },
        { title: '3. Refund Policy', body: 'If the scan detects files and restoreit fails to deliver them to your restoreit, you receive a full refund. If no files are detected, you are not charged. No refunds are issued for completed successful restores. Restore success depends on disk state at time of scan; we cannot restore data that has been physically overwritten.' },
        { title: '4. Data Retention', body: 'Standard tier data is available for immediate download only — no persistent storage. Pro tier data is retained in an encrypted private restoreit for 7 days and then automatically deleted. restoreit Pro subscribers receive 30-day retention. restoreit does not retain or archive user data beyond these windows.' },
        { title: '5. Encryption & Security', body: 'All data transmission is encrypted using TLS 1.3. Data at rest in restoreit is encrypted with AES-256. restoreit operates on a zero-access principle with respect to file content. Raw binary streams are processed but not indexed or catalogued by restoreit personnel.' },
        { title: '6. GDPR & Data Rights', body: 'Users in the European Economic Area may request deletion of all personal data ("right to be forgotten") at any time by contacting privacy@restoreit.app. We will confirm deletion within 30 days. We collect only the minimum data necessary to provide the service: email address, payment token, and anonymised scan metadata.' },
        { title: '7. COPPA', body: 'restoreit is not directed to children under the age of 13. We do not knowingly collect data from users under 13. If you believe a child has used the service, contact privacy@restoreit.app immediately.' },
        { title: '8. Warranty Disclaimer', body: 'restoreit makes no warranties regarding restore success rates. File restore is inherently dependent on disk state at time of scan. We represent our technology honestly: some files may not be restorable if sectors have been overwritten. Our Proof of Life mechanic ensures you only pay when we can demonstrate a successful result.' },
        { title: '9. Acceptable Use', body: 'Users may only scan drives they own or have explicit legal authorisation to restore. restoreit may not be used for illegal data access, competitive intelligence gathering, or forensic analysis of devices belonging to others. Violation results in immediate account termination.' },
        { title: '10. Changes to Terms', body: 'We may update these terms. Material changes will be communicated by email. Continued use after notification constitutes acceptance.' },
    ];
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans">
            <header className="flex items-center justify-between px-8 lg:px-16 py-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#8A2BE2] flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-sm"></div></div>
                    <span className="text-sm font-semibold tracking-wide text-white">restoreit</span>
                </Link>
                <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                    ← Back to Home
                </Link>
            </header>
            <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
                <div>
                    <h1 className="text-3xl font-semibold text-white mb-2">Terms of Service</h1>
                    <p className="text-xs text-zinc-600">Last updated: March 3, 2026</p>
                </div>
                {sections.map(({ title, body }) => (
                    <section key={title} className="space-y-2">
                        <h2 className="text-sm font-bold text-white">{title}</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
                    </section>
                ))}
                <div className="pt-4 border-t border-white/5 text-xs text-zinc-600">
                    Questions? <a href="mailto:legal@restoreit.app" className="text-[#8A2BE2] hover:underline">legal@restoreit.app</a>
                </div>
            </main>
        </div>
    );
}
