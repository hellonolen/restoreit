import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partners — Restore-as-a-Service API',
    description: 'Integrate restoreit forensic file recovery into your platform via REST API. Starter, Growth, and Enterprise tiers for IT shops, MSPs, and SaaS builders.',
    openGraph: {
        title: 'Partners — restoreit Restore-as-a-Service',
        description: 'Integrate forensic file recovery into your platform via REST API.',
    },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
