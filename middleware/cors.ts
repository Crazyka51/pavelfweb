import { NextResponse, NextRequest } from 'next/server';

// Povolené domény pro CORS
const allowedOrigins = [
  'https://www.fiserpavel.cz',
  'https://fiserpavel.cz',
  'http://localhost:3000'
];

export function middleware(request: NextRequest) {
  // Získáme Origin z hlavičky
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;

  // Pouze pro API auth endpointy
  if (pathname.startsWith('/api/admin/auth')) {
    const response = NextResponse.next();
    
    // Pouze pokud je validní Origin, nastavíme CORS hlavičky
    if (origin && allowedOrigins.includes(origin)) {
      // Nastavíme správnou doménu pro CORS podle té, ze které požadavek přišel
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Vary', 'Origin');
    }
    
    return response;
  }

  // Pro preflight OPTIONS požadavky vracíme 200 OK s CORS hlavičkami
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/admin/auth')) {
    const response = new NextResponse(null, { status: 200 });
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Vary', 'Origin');
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/auth/:path*']
};
