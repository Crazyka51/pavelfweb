import { NextRequest, NextResponse } from 'next/server';

// Middleware pro sledování auth požadavků
export function middleware(request: NextRequest) {
  // Pouze pro API auth endpointy
  if (request.nextUrl.pathname.startsWith('/api/admin/auth')) {
    console.log('Auth request:', {
      method: request.method,
      url: request.url,
      pathname: request.nextUrl.pathname,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        cookie: request.headers.has('cookie') ? '[přítomno]' : '[chybí]',
        authorization: request.headers.has('authorization') ? '[přítomno]' : '[chybí]'
      },
      // Nezaznamenávejte citlivé údaje v produkci
      cookies: request.cookies.getAll().map(c => c.name)
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/auth/:path*',
};