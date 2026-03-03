import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Simple session check (since we don't have a real backend, we'll check for a mock cookie)
    const isAuthenticated = request.cookies.has('restoreit_session');

    // Protect /account routes
    if (request.nextUrl.pathname.startsWith('/account') && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to /account if already logged in and visiting login
    if (request.nextUrl.pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/account', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/login'],
};
