import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://restoreit.app'
    const now = new Date().toISOString()

    // All public pages
    const routes = [
        '',
        '/about',
        '/how-it-works',
        '/pricing',
        '/faq',
        '/support',
        '/contact',
        '/partners',
        '/docs/raas',
        '/blog',
        '/blog/recover-deleted-files-without-installing-software',
        '/blog/cloud-vs-traditional-data-recovery',
        '/blog/accidentally-formatted-drive',
        '/login',
        '/signup',
        '/restore',
        '/checkout',
        '/privacy',
        '/terms',
        '/disclaimers',
    ]

    return routes.map((route) => ({
        url: `${base}${route}`,
        lastModified: now,
        changeFrequency: route === '' || route === '/blog' ? 'weekly' as const : route.startsWith('/blog/') ? 'monthly' as const : 'monthly' as const,
        priority: route === '' ? 1.0 : route === '/pricing' || route === '/partners' ? 0.9 : route === '/blog' ? 0.8 : route.startsWith('/blog/') ? 0.7 : 0.7,
    }))
}
