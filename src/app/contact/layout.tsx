import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with the restoreit team. Email team@restoreit.app for support, partnerships, or general inquiries.',
    openGraph: {
        title: 'Contact — restoreit',
        description: 'Reach the restoreit team at team@restoreit.app.',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
