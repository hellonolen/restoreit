import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://restoreit.app'),
  title: {
    default: 'restoreit — Cloud File Restoration',
    template: '%s — restoreit',
  },
  description: 'Cloud-based file restoration that never writes to your drive. Scan, preview, and restore deleted files.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://restoreit.app',
    siteName: 'restoreit',
    title: 'restoreit — Cloud File Restoration',
    description: 'Cloud-based file restoration that never writes to your drive. Scan, preview, and restore deleted files.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'restoreit — Cloud File Restoration',
    description: 'Cloud-based file restoration that never writes to your drive. Scan, preview, and restore deleted files.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
