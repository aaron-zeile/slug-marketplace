import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin-session');
  const { pathname } = request.nextUrl;

  const isPublic = pathname === '/admin/login' || pathname === '/admin' || pathname === '/admin/';

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
