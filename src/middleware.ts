import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.has('restoreit_session');
    const { pathname } = request.nextUrl;

    // Protect authenticated routes
    const protectedPaths = ['/account', '/checkout', '/restore'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect logged-in users away from login/signup
    if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
        return NextResponse.redirect(new URL('/restore', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/checkout/:path*', '/restore/:path*', '/login', '/signup'],
};
