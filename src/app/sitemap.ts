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
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : route === '/pricing' || route === '/partners' ? 0.9 : 0.7,
    }))
}
