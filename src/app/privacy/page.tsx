import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
export const metadata = { title: 'Privacy Policy — restoreit', description: 'Privacy Policy for restoreit. What we collect, how we use it, your rights.' };
export default function PrivacyPage() {
    const sections = [
        { title: 'What We Collect', body: 'We collect your email address (for restoration delivery), a payment token from our payment processor (we never see your full card number), anonymised scan metadata (drive size, file type counts, scan duration for service improvement), and server logs (IP address, request timestamps — retained 30 days).' },
        { title: 'What We Do NOT Collect', body: 'We do not collect, store, or index the content of your restored files. We do not collect device identifiers beyond what is technically necessary for the relay session. We do not use tracking pixels, cross-site cookies, or share data with advertising networks.' },
        { title: 'How We Use Your Data', body: 'Email: to deliver your restoration link and product updates (opt-out available). Payment token: to process your one-time charge or subscription. Scan metadata: anonymous aggregate analytics to improve restoration algorithms. Nothing is sold to third parties.' },
        { title: 'Data Retention', body: 'Email and transaction records: retained for 7 years for legal and tax compliance. Scan metadata: retained in anonymised form indefinitely. restoreit content: deleted automatically after 7 days (Standard) or 30 days (Pro). All raw disk stream data is discarded immediately after restoration.' },
        { title: 'Encryption', body: 'All data in transit uses TLS 1.3. All data at rest in restoreit Cloud uses AES-256. Cloud access requires email verification and is optionally protected by two-factor authentication.' },
        { title: 'Your Rights (GDPR)', body: 'If you are in the EU or EEA, you have the right to access, correct, export, or delete your personal data. To exercise any of these rights, email privacy@restoreit.app. We respond within 30 days. You may withdraw consent for email marketing at any time via the unsubscribe link in any email.' },
        { title: 'Zero-Knowledge Principle', body: 'restoreit processes raw binary streams from your disk. Our infrastructure does not read, interpret, or catalogue file content for any purpose other than restoration. Employees cannot access the content of your restoreit Cloud storage. Cloud data is encrypted with a key derived from your session — not accessible to restoreit staff.' },
        { title: 'Cookies', body: 'We use a single session cookie for checkout authentication. We do not use tracking cookies, analytics cookies, or third-party marketing cookies.' },
        { title: 'Children', body: 'restoreit is not directed to children under 13. We do not knowingly collect any personal data from children. If you believe a child has created an account, contact privacy@restoreit.app.' },
        { title: 'Changes', body: 'Material changes to this policy will be communicated by email at least 14 days before taking effect. The date of last update is shown at the top of this page.' },
    ];
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />
            <main className="flex-1 pt-28 max-w-2xl mx-auto px-6 py-16 space-y-10 w-full">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
                    <p className="text-xs text-[var(--color-text-dim)]">Last updated: March 3, 2026</p>
                </div>
                {sections.map(({ title, body }) => (
                    <section key={title} className="space-y-2">
                        <h2 className="text-sm font-bold">{title}</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
                    </section>
                ))}
                <div className="pt-4 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-dim)]">
                    Data inquiries: <a href="mailto:privacy@restoreit.app" className="text-[var(--color-accent)] hover:underline">privacy@restoreit.app</a>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
