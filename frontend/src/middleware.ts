import { type NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/projects'];
// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/register'];

// NOTE: Next.js middleware runs on the server and cannot access localStorage.
// We use a cookie named `auth_token` as the server-readable auth signal.
// The AuthProvider sets this cookie on login and clears it on logout.
// For full security, upgrade to httpOnly cookies via a Next.js route handler proxy.

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
