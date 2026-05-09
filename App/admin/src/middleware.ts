import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE = '/admin';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin-session');
  const { pathname } = request.nextUrl;

  const isPublic = pathname === '/login' || pathname === '/';

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL(`${BASE}/login`, request.url));
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL(`${BASE}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
