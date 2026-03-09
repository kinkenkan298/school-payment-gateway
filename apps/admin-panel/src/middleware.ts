import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const tokenFromCookie = request.cookies.get('access_token')?.value;

  if (isPublicRoute && tokenFromCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!isPublicRoute && !tokenFromCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
