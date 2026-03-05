import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/account/',
                    '/checkout/',
                    '/restore',
                    '/login',
                    '/signup',
                ],
            },
        ],
        sitemap: 'https://restoreit.app/sitemap.xml',
    }
}
