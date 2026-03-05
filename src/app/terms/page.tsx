import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
export const metadata = { title: 'Terms of Service — restoreit', description: 'Terms of Service for restoreit cloud file restore platform.' };
export default function TermsPage() {
    const sections = [
        { title: '1. Service Description', body: 'restoreit provides cloud-based file restoration services. Users connect a memory-only relay to stream raw disk data for analysis and restoration. restoreit does not guarantee that any files can be restored. Restoration success depends entirely on the physical state of your storage device at the time of scan.' },
        { title: '2. Payment & Pricing', body: 'All transactions are one-time purchases unless a restoreit Pro subscription is explicitly selected. Charges are applied only after restorable files have been detected and confirmed ("Proof of Life"). Subscriptions bill monthly and may be cancelled at any time with immediate effect.' },
        { title: '3. Payment Policy', body: 'All completed purchases are final. No refunds are issued. You review scan results before purchasing. If no files are detected during the scan, no charge is applied. Restore success depends on disk state at time of scan; we cannot restore data that has been physically overwritten.' },
        { title: '4. Data Retention', body: 'Standard tier data is retained in restoreit Cloud for 48 hours, after which it is automatically purged. Pro tier data is retained in an encrypted private restoreit Cloud for 7 days and then automatically deleted. restoreit Pro subscribers receive 30-day retention. restoreit does not retain or archive user data beyond these windows.' },
        { title: '5. Encryption & Security', body: 'All data transmission is encrypted using TLS 1.3. Data at rest in restoreit is encrypted with AES-256. restoreit operates on a zero-access principle with respect to file content. Raw binary streams are processed but not indexed or catalogued by restoreit personnel.' },
        { title: '6. GDPR & Data Rights', body: 'Users in the European Economic Area may request deletion of all personal data ("right to be forgotten") at any time by contacting privacy@restoreit.app. We will confirm deletion within 30 days. We collect only the minimum data necessary to provide the service: email address, payment token, and anonymised scan metadata.' },
        { title: '7. COPPA', body: 'restoreit is not directed to children under the age of 13. We do not knowingly collect data from users under 13. If you believe a child has used the service, contact privacy@restoreit.app immediately.' },
        { title: '8. Warranty Disclaimer', body: 'restoreit makes no warranties regarding restoration success rates. File restoration is inherently dependent on the physical condition of the storage device at the time of scan. Some or all files may not be restorable if sectors have been overwritten, physically damaged, or otherwise compromised. restoreit does not guarantee restoration of any specific files or data. You review scan results before purchasing.' },
        { title: '9. Acceptable Use', body: 'Users may only scan drives they own or have explicit legal authorisation to restore. restoreit may not be used for illegal data access, competitive intelligence gathering, or forensic analysis of devices belonging to others. Violation results in immediate account termination.' },
        { title: '10. Changes to Terms', body: 'We may update these terms. Material changes will be communicated by email. Continued use after notification constitutes acceptance.' },
    ];
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />
            <main className="flex-1 pt-28 max-w-2xl mx-auto px-6 py-16 space-y-10 w-full">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
                    <p className="text-xs text-[var(--color-text-dim)]">Last updated: March 3, 2026</p>
                </div>
                {sections.map(({ title, body }) => (
                    <section key={title} className="space-y-2">
                        <h2 className="text-sm font-bold">{title}</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
                    </section>
                ))}
                <div className="pt-4 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-dim)]">
                    Questions? <a href="mailto:legal@restoreit.app" className="text-[var(--color-accent)] hover:underline">legal@restoreit.app</a>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
