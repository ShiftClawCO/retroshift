import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/signout',
  '/api/summary',
];

// Check if path matches a pattern (supports /r/:code style)
function isPublicPath(pathname: string): boolean {
  // Exact matches
  if (publicPaths.includes(pathname)) return true;
  
  // Pattern matches
  if (pathname.startsWith('/r/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/api/')) return true;
  
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // For protected paths, check for WorkOS session cookie
  const sessionCookie = request.cookies.get('wos-session');
  
  if (!sessionCookie) {
    // Redirect to login if no session
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
