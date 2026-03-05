import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public API routes use API key auth, not cookies — skip middleware
    if (pathname.startsWith('/api/v1/')) {
        const response = NextResponse.next();
        response.headers.set('X-Content-Type-Options', 'nosniff');
        return response;
    }

    const isAuthenticated = request.cookies.has('restoreit_session');

    // Protect authenticated routes
    const protectedPaths = ['/account', '/checkout', '/restore'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected && !isAuthenticated) {
        const redirectUrl = new URL('/signup', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect logged-in users away from login/signup
    if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
        return NextResponse.redirect(new URL('/restore', request.url));
    }

    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: ['/account/:path*', '/checkout/:path*', '/restore/:path*', '/login', '/signup', '/api/v1/:path*'],
};
