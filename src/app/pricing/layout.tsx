import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'restoreit pricing — Scan ($89), Pro ($249), Cloud ($79/yr), and Protection ($29/mo). Per-device pricing, no subscriptions required.',
    openGraph: {
        title: 'Pricing — restoreit',
        description: 'Simple, honest per-device pricing. Scan, restore, and protect your data.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
