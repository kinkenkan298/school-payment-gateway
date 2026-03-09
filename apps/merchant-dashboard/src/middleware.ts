import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route yang tidak butuh autentikasi
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Cek token dari cookie (di-set saat login via server action/cookie)
  // Atau dari header Authorization (untuk API calls)
  const tokenFromCookie = request.cookies.get('access_token')?.value;

  // Jika sudah login dan mengakses halaman publik → redirect ke dashboard
  if (isPublicRoute && tokenFromCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika belum login dan mengakses halaman private → redirect ke login
  if (!isPublicRoute && !tokenFromCookie) {
    const loginUrl = new URL('/login', request.url);
    // Simpan URL tujuan untuk redirect setelah login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - file dengan ekstensi (gambar, font, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
