import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
    title: 'Disclaimers — restoreit',
    description: 'Important disclaimers about restoreit cloud file restoration services.',
};

const disclaimers = [
    {
        title: 'No Guarantee of Restoration',
        body: 'restoreit does not guarantee that any specific files, data, or information can be restored. File restoration depends on the physical condition of the storage device, the extent of data overwriting since deletion, the file system type, and other factors outside our control. Restoration results vary by device and situation.',
    },
    {
        title: 'No Guarantee of Data Integrity',
        body: 'Restored files may be partial, corrupted, or incomplete. Integrity scores displayed during the review process are estimates based on sector analysis and do not constitute a guarantee of file usability. Files with lower integrity scores may not open or may contain errors.',
    },
    {
        title: 'All Sales Final',
        body: 'All completed purchases are final. restoreit Scan, restoreit Pro, restoreit Cloud, and restoreit Protection purchases are non-refundable. You review scan results before purchasing, giving you the opportunity to assess what was detected prior to payment.',
    },
    {
        title: 'Per-Device Pricing',
        body: 'restoreit Scan and restoreit Pro are priced per device. Each device requires a separate purchase. A "device" refers to a single physical storage drive (internal drive, external drive, USB drive, or SD card).',
    },
    {
        title: 'Not a Substitute for Backup',
        body: 'restoreit is a restoration tool, not a backup solution. We strongly recommend maintaining regular backups of important data. No restoration tool — including restoreit — can guarantee 100% restoration of all deleted or lost data.',
    },
    {
        title: 'Disk Condition Risk',
        body: 'Running any restoration scan on a physically failing drive carries inherent risk. If you suspect physical damage (clicking sounds, grinding, drive not powering on), consult a professional data restoration lab before using any software-based restoration tool, including restoreit.',
    },
    {
        title: 'Third-Party Services',
        body: 'restoreit uses third-party payment processors and infrastructure providers. We are not responsible for the availability, security practices, or policies of third-party services. Payment processing is handled by our payment partner and is subject to their terms.',
    },
    {
        title: 'Encryption and Security Disclaimer',
        body: 'While we employ industry-standard encryption (TLS 1.3 in transit, AES-256 at rest), no system is completely immune to security threats. We implement commercially reasonable security measures but cannot guarantee absolute security of data during transmission or storage.',
    },
    {
        title: 'restoreit Protection Disclaimer',
        body: 'The restoreit Protection Plan provides disk health monitoring and corruption alerts as a best-effort service. Monitoring alerts are based on S.M.A.R.T. data and pattern analysis. We do not guarantee detection of all potential drive failures. Protection monitoring does not replace regular data backups.',
    },
    {
        title: 'Service Availability',
        body: 'restoreit is a cloud-based service that requires an active internet connection. We strive for high availability but do not guarantee uninterrupted access. Scheduled and unscheduled maintenance may affect service availability.',
    },
];

export default function DisclaimersPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <div className="max-w-2xl mx-auto px-6 md:px-8 space-y-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Disclaimers</h1>
                        <p className="text-xs text-[var(--color-text-dim)]">Last updated: March 3, 2026</p>
                    </div>

                    {disclaimers.map(({ title, body }) => (
                        <section key={title} className="space-y-2">
                            <h2 className="text-sm font-bold">{title}</h2>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
                        </section>
                    ))}
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
